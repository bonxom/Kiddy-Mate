from __future__ import annotations

import asyncio

import httpx

from ai_gateway.config import GatewaySettings
from ai_gateway.errors import GatewayError
from ai_gateway.providers.http import execute_with_retry
from ai_gateway.providers.speech_models import TtsResult


class VbeeTtsProvider:
    provider_name = "vbee"

    def __init__(self, client: httpx.AsyncClient, settings: GatewaySettings) -> None:
        self.client = client
        self.settings = settings

    async def synthesize_speech(
        self,
        *,
        text: str,
        voice_name: str | None,
        language_code: str | None,
        audio_encoding: str | None,
        speaking_rate: float | None,
        pitch: float | None,
        request_id: str,
    ) -> TtsResult:
        del pitch

        if not self.settings.is_vbee_tts_configured:
            raise GatewayError(
                code="vbee_tts_not_configured",
                message="VBee TTS is not configured for the AI gateway.",
                status_code=503,
            )

        resolved_audio_type = self._resolve_audio_type(audio_encoding)
        resolved_voice_code = self._resolve_voice_code(voice_name)
        resolved_language_code = (language_code or self.settings.GOOGLE_TTS_LANGUAGE_CODE).strip() or "vi-VN"

        submit_payload = {
            "app_id": self.settings.VBEE_TTS_APP_ID,
            "response_type": "indirect",
            "callback_url": self.settings.VBEE_TTS_CALLBACK_URL,
            "input_text": text,
            "voice_code": resolved_voice_code,
            "audio_type": resolved_audio_type,
            "bitrate": self.settings.VBEE_TTS_BITRATE,
            "speed_rate": speaking_rate if speaking_rate is not None else self.settings.VBEE_TTS_SPEED_RATE,
        }

        submit_response = await execute_with_retry(
            lambda: self.client.post(
                self.settings.VBEE_TTS_BASE_URL.rstrip("/"),
                json=submit_payload,
                headers=self._build_headers(request_id),
            ),
            retries=self.settings.AI_GATEWAY_MAX_RETRIES,
            retry_backoff_seconds=self.settings.AI_GATEWAY_RETRY_BACKOFF_SECONDS,
            upstream_name="vbee_tts_submit",
        )

        submit_data = submit_response.json()
        request_token = self._extract_request_id(submit_data)
        status_data = await self._poll_until_ready(request_token=request_token, request_id=request_id)
        audio_link = self._extract_audio_link(status_data, request_token=request_token)

        audio_response = await execute_with_retry(
            lambda: self.client.get(
                audio_link,
                headers={"X-Request-Id": request_id},
                follow_redirects=True,
            ),
            retries=self.settings.AI_GATEWAY_MAX_RETRIES,
            retry_backoff_seconds=self.settings.AI_GATEWAY_RETRY_BACKOFF_SECONDS,
            upstream_name="vbee_tts_audio",
        )

        if not audio_response.content:
            raise GatewayError(
                code="vbee_tts_empty_audio",
                message="VBee TTS returned an empty audio payload.",
                status_code=502,
                details={"requestId": request_token},
            )

        normalized_content_type = (audio_response.headers.get("Content-Type") or "").lower()
        if (
            ("text/html" in normalized_content_type or "application/json" in normalized_content_type)
            and self._detect_audio_encoding(
                audio_bytes=audio_response.content,
                content_type=audio_response.headers.get("Content-Type"),
                fallback_audio_type=resolved_audio_type,
            )
            == ("WAV" if resolved_audio_type == "wav" else "MP3")
            and not audio_response.content.startswith((b"RIFF", b"ID3", b"\xff\xfb", b"\xff\xf3"))
        ):
            raise GatewayError(
                code="vbee_tts_invalid_audio_payload",
                message="VBee audio_link returned a non-audio payload.",
                status_code=502,
                details={
                    "requestId": request_token,
                    "contentType": audio_response.headers.get("Content-Type"),
                    "preview": audio_response.text[:120],
                },
            )

        return TtsResult(
            audio_bytes=audio_response.content,
            provider=self.provider_name,
            audio_encoding=self._detect_audio_encoding(
                audio_bytes=audio_response.content,
                content_type=audio_response.headers.get("Content-Type"),
                fallback_audio_type=resolved_audio_type,
            ),
            voice_name=resolved_voice_code,
            language_code=resolved_language_code,
        )

    def _build_headers(self, request_id: str) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.settings.VBEE_TTS_BEARER_TOKEN}",
            "Content-Type": "application/json",
            "X-Request-Id": request_id,
        }

    def _resolve_voice_code(self, voice_name: str | None) -> str:
        requested_voice_name = (voice_name or "").strip()
        if requested_voice_name in self.settings.vbee_tts_voice_map:
            return self.settings.vbee_tts_voice_map[requested_voice_name]

        if self._looks_like_vbee_voice_code(requested_voice_name):
            return requested_voice_name

        return self.settings.VBEE_TTS_DEFAULT_VOICE_CODE

    @staticmethod
    def _looks_like_vbee_voice_code(voice_name: str) -> bool:
        if not voice_name:
            return False

        lowered = voice_name.lower()
        if lowered.startswith("vi-"):
            return False

        return "_vc" in lowered or lowered.startswith(("hn_", "n_")) or "-fhg" in lowered

    def _resolve_audio_type(self, audio_encoding: str | None) -> str:
        configured_default = (self.settings.VBEE_TTS_AUDIO_TYPE or "").strip()
        normalized = (audio_encoding or configured_default).strip().upper()
        if not normalized:
            return "mp3"
        if normalized in {"MP3", "MPEG"}:
            return "mp3"
        if normalized in {"WAV", "LINEAR16"}:
            return "wav"

        raise GatewayError(
            code="vbee_tts_audio_encoding_unsupported",
            message=f"VBee TTS does not support audio encoding '{audio_encoding}'.",
            status_code=400,
        )

    def _extract_request_id(self, submit_data: dict[str, object]) -> str:
        if not isinstance(submit_data, dict):
            raise GatewayError(
                code="vbee_tts_submit_invalid_response",
                message="VBee TTS submit response was not a JSON object.",
                status_code=502,
                details={"upstreamPayload": submit_data},
            )

        result = submit_data.get("result")
        request_token = result.get("request_id") if isinstance(result, dict) else None
        if submit_data.get("status") == 1 and isinstance(request_token, str) and request_token.strip():
            return request_token.strip()

        raise GatewayError(
            code="vbee_tts_submit_failed",
            message=str(submit_data.get("error_message") or "VBee TTS did not return a request_id."),
            status_code=502,
            details={"upstreamPayload": submit_data},
        )

    async def _poll_until_ready(self, *, request_token: str, request_id: str) -> dict[str, object]:
        status_url = f"{self.settings.VBEE_TTS_BASE_URL.rstrip('/')}/{request_token}"

        for attempt in range(self.settings.VBEE_TTS_MAX_POLL_ATTEMPTS):
            response = await execute_with_retry(
                lambda: self.client.get(
                    status_url,
                    headers=self._build_headers(request_id),
                ),
                retries=self.settings.AI_GATEWAY_MAX_RETRIES,
                retry_backoff_seconds=self.settings.AI_GATEWAY_RETRY_BACKOFF_SECONDS,
                upstream_name="vbee_tts_status",
            )

            payload = response.json()
            if not isinstance(payload, dict):
                raise GatewayError(
                    code="vbee_tts_status_invalid_response",
                    message="VBee TTS status response was not a JSON object.",
                    status_code=502,
                    details={"upstreamPayload": payload},
                )

            result = payload.get("result")
            status = str(result.get("status") or "").strip().upper() if isinstance(result, dict) else ""

            if payload.get("status") != 1:
                raise GatewayError(
                    code="vbee_tts_status_failed",
                    message=str(payload.get("error_message") or "VBee TTS status request failed."),
                    status_code=502,
                    details={"upstreamPayload": payload, "requestId": request_token},
                )

            if status == "SUCCESS":
                return payload

            if status == "FAILURE":
                raise GatewayError(
                    code="vbee_tts_generation_failed",
                    message="VBee TTS reported a failed synthesis request.",
                    status_code=502,
                    details={"upstreamPayload": payload, "requestId": request_token},
                )

            if attempt < self.settings.VBEE_TTS_MAX_POLL_ATTEMPTS - 1:
                await asyncio.sleep(self.settings.VBEE_TTS_POLL_INTERVAL_SECONDS)

        raise GatewayError(
            code="vbee_tts_timeout",
            message="VBee TTS did not finish before the polling timeout.",
            status_code=504,
            details={"requestId": request_token, "maxPollAttempts": self.settings.VBEE_TTS_MAX_POLL_ATTEMPTS},
        )

    @staticmethod
    def _extract_audio_link(status_data: dict[str, object], *, request_token: str) -> str:
        result = status_data.get("result")
        audio_link = result.get("audio_link") if isinstance(result, dict) else None
        if isinstance(audio_link, str) and audio_link.strip():
            return audio_link.strip()

        raise GatewayError(
            code="vbee_tts_audio_link_missing",
            message="VBee TTS completed but did not return an audio_link.",
            status_code=502,
            details={"upstreamPayload": status_data, "requestId": request_token},
        )

    @staticmethod
    def _detect_audio_encoding(
        *,
        audio_bytes: bytes,
        content_type: str | None,
        fallback_audio_type: str,
    ) -> str:
        normalized_content_type = (content_type or "").lower()
        if "wav" in normalized_content_type or "wave" in normalized_content_type:
            return "WAV"
        if "mpeg" in normalized_content_type or "mp3" in normalized_content_type:
            return "MP3"

        if audio_bytes.startswith(b"RIFF"):
            return "WAV"
        if audio_bytes.startswith(b"ID3") or audio_bytes[:2] in {b"\xff\xfb", b"\xff\xf3"}:
            return "MP3"

        return "WAV" if fallback_audio_type == "wav" else "MP3"
