from __future__ import annotations

import time
from dataclasses import dataclass

from ai_gateway.auth import AuthenticatedChild
from ai_gateway.providers import GeminiProvider, GeminiResult, GoogleSpeechProvider, SttResult, TtsResult
from ai_gateway.services.tts_gateway_service import TtsGatewayService


@dataclass(slots=True)
class TimedResult:
    value: GeminiResult | SttResult | TtsResult
    latency_ms: int


class RuntimeGatewayService:
    def __init__(
        self,
        gemini_provider: GeminiProvider,
        google_speech_provider: GoogleSpeechProvider,
        tts_service: TtsGatewayService,
    ) -> None:
        self.gemini_provider = gemini_provider
        self.google_speech_provider = google_speech_provider
        self.tts_service = tts_service

    async def generate_response(
        self,
        *,
        user_message: str,
        system_prompt: str | None,
        conversation_context: str | None,
        model_override: str | None,
        temperature: float | None,
        max_output_tokens: int | None,
        request_id: str,
        child: AuthenticatedChild,
    ) -> TimedResult:
        del child
        started_at = time.perf_counter()
        value = await self.gemini_provider.generate_text(
            user_message=user_message,
            system_prompt=system_prompt,
            conversation_context=conversation_context,
            model_override=model_override,
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            request_id=request_id,
        )
        return TimedResult(value=value, latency_ms=int((time.perf_counter() - started_at) * 1000))

    async def recognize_speech(
        self,
        *,
        audio_bytes: bytes,
        encoding: str,
        sample_rate_hertz: int,
        language_code: str | None,
        request_id: str,
        child: AuthenticatedChild,
    ) -> TimedResult:
        del child
        started_at = time.perf_counter()
        value = await self.google_speech_provider.recognize_speech(
            audio_bytes=audio_bytes,
            encoding=encoding,
            sample_rate_hertz=sample_rate_hertz,
            language_code=language_code,
            request_id=request_id,
        )
        return TimedResult(value=value, latency_ms=int((time.perf_counter() - started_at) * 1000))

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
        child: AuthenticatedChild,
    ) -> TimedResult:
        del child
        started_at = time.perf_counter()
        value = await self.tts_service.synthesize_speech(
            text=text,
            voice_name=voice_name,
            language_code=language_code,
            audio_encoding=audio_encoding,
            speaking_rate=speaking_rate,
            pitch=pitch,
            request_id=request_id,
        )
        return TimedResult(value=value, latency_ms=int((time.perf_counter() - started_at) * 1000))
