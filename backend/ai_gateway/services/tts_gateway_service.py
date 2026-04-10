from __future__ import annotations

from collections.abc import Awaitable, Callable

from ai_gateway.config import GatewaySettings
from ai_gateway.errors import GatewayError
from ai_gateway.providers import GoogleSpeechProvider, TtsResult, VbeeTtsProvider


TtsProviderOperation = Callable[..., Awaitable[TtsResult]]


class TtsGatewayService:
    def __init__(
        self,
        *,
        settings: GatewaySettings,
        google_provider: GoogleSpeechProvider,
        vbee_provider: VbeeTtsProvider,
    ) -> None:
        self.settings = settings
        self.google_provider = google_provider
        self.vbee_provider = vbee_provider

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
        provider_errors: list[dict[str, str]] = []

        for index, provider_name in enumerate(self.settings.tts_provider_chain):
            try:
                result = await self._get_provider_operation(provider_name)(
                    text=text,
                    voice_name=voice_name,
                    language_code=language_code,
                    audio_encoding=audio_encoding,
                    speaking_rate=speaking_rate,
                    pitch=pitch,
                    request_id=request_id,
                )
                if index > 0:
                    result.fallback_from = self.settings.tts_provider_chain[0]
                return result
            except GatewayError as exc:
                provider_errors.append(
                    {
                        "provider": provider_name,
                        "code": exc.code,
                        "message": exc.message,
                    }
                )
                if index == len(self.settings.tts_provider_chain) - 1:
                    raise GatewayError(
                        code="tts_all_providers_failed",
                        message="All configured TTS providers failed to synthesize audio.",
                        status_code=exc.status_code,
                        details={"providerErrors": provider_errors},
                    ) from exc

        raise GatewayError(
            code="tts_provider_chain_empty",
            message="No TTS providers are configured for the AI gateway.",
            status_code=503,
        )

    def _get_provider_operation(self, provider_name: str) -> TtsProviderOperation:
        if provider_name == "vbee":
            return self.vbee_provider.synthesize_speech
        if provider_name == "google":
            return self.google_provider.synthesize_speech

        raise GatewayError(
            code="tts_provider_unknown",
            message=f"Unsupported TTS provider '{provider_name}'.",
            status_code=500,
        )
