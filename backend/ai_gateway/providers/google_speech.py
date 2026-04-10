from __future__ import annotations

import asyncio
import base64
from datetime import UTC, datetime, timedelta

import httpx
from google.auth.transport.requests import Request as GoogleAuthRequest
from google.oauth2 import service_account

from ai_gateway.config import GatewaySettings
from ai_gateway.errors import GatewayError
from ai_gateway.providers.http import execute_with_retry
from ai_gateway.providers.speech_models import SttResult, TtsResult

GOOGLE_CLOUD_SCOPE = "https://www.googleapis.com/auth/cloud-platform"


class GoogleAccessTokenProvider:
    def __init__(self, settings: GatewaySettings) -> None:
        self.settings = settings
        self._lock = asyncio.Lock()
        self._credentials = None
        self._expires_at_utc: datetime | None = None

    async def get_access_token(self) -> str:
        async with self._lock:
            if self._credentials is None:
                service_account_info = self.settings.google_service_account_info
                if not service_account_info:
                    raise GatewayError(
                        code="google_service_account_missing",
                        message="GOOGLE_SERVICE_ACCOUNT_JSON_B64 is not configured for the gateway.",
                        status_code=500,
                    )

                self._credentials = service_account.Credentials.from_service_account_info(
                    service_account_info,
                    scopes=[GOOGLE_CLOUD_SCOPE],
                )

            if self._expires_at_utc and datetime.now(UTC) < self._expires_at_utc:
                token = getattr(self._credentials, "token", None)
                if token:
                    return token

            await asyncio.to_thread(self._credentials.refresh, GoogleAuthRequest())
            token = getattr(self._credentials, "token", None)
            if not token:
                raise GatewayError(
                    code="google_access_token_unavailable",
                    message="Google service account could not produce an access token.",
                    status_code=502,
                )

            expiry = getattr(self._credentials, "expiry", None)
            if isinstance(expiry, datetime):
                self._expires_at_utc = expiry.astimezone(UTC) - timedelta(seconds=60)
            else:
                self._expires_at_utc = datetime.now(UTC) + timedelta(minutes=50)

            return token


class GoogleSpeechProvider:
    provider_name = "google_cloud"

    def __init__(self, client: httpx.AsyncClient, settings: GatewaySettings) -> None:
        self.client = client
        self.settings = settings
        self.token_provider = GoogleAccessTokenProvider(settings)

    async def recognize_speech(
        self,
        *,
        audio_bytes: bytes,
        encoding: str,
        sample_rate_hertz: int,
        language_code: str | None,
        request_id: str,
    ) -> SttResult:
        token = await self.token_provider.get_access_token()
        payload = {
            "config": {
                "encoding": encoding,
                "sampleRateHertz": sample_rate_hertz,
                "languageCode": language_code or self.settings.GOOGLE_STT_LANGUAGE_CODE,
            },
            "audio": {
                "content": base64.b64encode(audio_bytes).decode("ascii"),
            },
        }

        response = await execute_with_retry(
            lambda: self.client.post(
                "https://speech.googleapis.com/v1/speech:recognize",
                json=payload,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                    "X-Request-Id": request_id,
                },
            ),
            retries=self.settings.AI_GATEWAY_MAX_RETRIES,
            retry_backoff_seconds=self.settings.AI_GATEWAY_RETRY_BACKOFF_SECONDS,
            upstream_name="google_stt",
        )

        data = response.json()
        results = data.get("results") or []
        if not results:
            raise GatewayError(
                code="speech_not_detected",
                message="Google STT did not detect any speech in the submitted audio.",
                status_code=422,
                details={"upstreamPayload": data},
            )

        alternatives = (results[0] or {}).get("alternatives") or []
        if not alternatives:
            raise GatewayError(
                code="google_stt_invalid_response",
                message="Google STT response did not contain recognition alternatives.",
                status_code=502,
                details={"upstreamPayload": data},
            )

        best = alternatives[0] or {}
        transcript = str(best.get("transcript") or "").strip()
        if not transcript:
            raise GatewayError(
                code="google_stt_empty_transcript",
                message="Google STT returned an empty transcript.",
                status_code=422,
                details={"upstreamPayload": data},
            )

        confidence = best.get("confidence")
        return SttResult(
            transcript=transcript,
            confidence=float(confidence) if confidence is not None else None,
            provider=self.provider_name,
            language_code=payload["config"]["languageCode"],
        )

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
        token = await self.token_provider.get_access_token()
        resolved_language_code = language_code or self.settings.GOOGLE_TTS_LANGUAGE_CODE
        resolved_voice_name = voice_name or self.settings.GOOGLE_TTS_VOICE_NAME
        resolved_audio_encoding = audio_encoding or self.settings.GOOGLE_TTS_AUDIO_ENCODING

        payload = {
            "input": {"text": text},
            "voice": {
                "name": resolved_voice_name,
                "languageCode": resolved_language_code,
            },
            "audioConfig": {
                "audioEncoding": resolved_audio_encoding,
                "speakingRate": speaking_rate if speaking_rate is not None else self.settings.GOOGLE_TTS_SPEAKING_RATE,
                "pitch": pitch if pitch is not None else self.settings.GOOGLE_TTS_PITCH,
            },
        }

        response = await execute_with_retry(
            lambda: self.client.post(
                "https://texttospeech.googleapis.com/v1/text:synthesize",
                json=payload,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                    "X-Request-Id": request_id,
                },
            ),
            retries=self.settings.AI_GATEWAY_MAX_RETRIES,
            retry_backoff_seconds=self.settings.AI_GATEWAY_RETRY_BACKOFF_SECONDS,
            upstream_name="google_tts",
        )

        data = response.json()
        audio_content = data.get("audioContent")
        if not audio_content:
            raise GatewayError(
                code="google_tts_empty_audio",
                message="Google TTS response did not contain audioContent.",
                status_code=502,
                details={"upstreamPayload": data},
            )

        return TtsResult(
            audio_bytes=base64.b64decode(audio_content),
            provider=self.provider_name,
            audio_encoding=resolved_audio_encoding,
            voice_name=resolved_voice_name,
            language_code=resolved_language_code,
        )
