from __future__ import annotations

import pytest

from ai_gateway.config import GatewaySettings
from ai_gateway.errors import GatewayError
from ai_gateway.providers.speech_models import TtsResult
from ai_gateway.services.tts_gateway_service import TtsGatewayService


class FakeProvider:
    def __init__(self, provider_name: str, result: TtsResult | None = None, error: GatewayError | None = None) -> None:
        self.provider_name = provider_name
        self.result = result
        self.error = error
        self.calls: list[dict[str, object]] = []

    async def synthesize_speech(self, **kwargs) -> TtsResult:
        self.calls.append(kwargs)
        if self.error:
            raise self.error
        assert self.result is not None
        return self.result


def _build_settings(**overrides) -> GatewaySettings:
    return GatewaySettings(
        SECRET_KEY="test-secret",
        GOOGLE_SERVICE_ACCOUNT_JSON_B64="e30=",
        VBEE_TTS_APP_ID="app-id",
        VBEE_TTS_BEARER_TOKEN="bearer-token",
        **overrides,
    )


@pytest.mark.asyncio
async def test_vbee_primary_succeeds_without_fallback() -> None:
    settings = _build_settings(
        AI_GATEWAY_TTS_PRIMARY_PROVIDER="vbee",
        AI_GATEWAY_TTS_ENABLE_FALLBACK=True,
        AI_GATEWAY_TTS_FALLBACK_PROVIDER="google",
    )
    vbee_provider = FakeProvider(
        "vbee",
        result=TtsResult(
            audio_bytes=b"VBEE",
            provider="vbee",
            audio_encoding="MP3",
            voice_name="n_hanoi_female_thaomaii_children_vc",
            language_code="vi-VN",
        ),
    )
    google_provider = FakeProvider(
        "google_cloud",
        result=TtsResult(
            audio_bytes=b"GOOGLE",
            provider="google_cloud",
            audio_encoding="MP3",
            voice_name="vi-VN-Standard-A",
            language_code="vi-VN",
        ),
    )
    service = TtsGatewayService(
        settings=settings,
        google_provider=google_provider,
        vbee_provider=vbee_provider,
    )

    result = await service.synthesize_speech(
        text="xin chao",
        voice_name="vi-VN-Standard-A",
        language_code="vi-VN",
        audio_encoding="MP3",
        speaking_rate=1.0,
        pitch=0.0,
        request_id="req-1",
    )

    assert result.provider == "vbee"
    assert result.fallback_from is None
    assert len(vbee_provider.calls) == 1
    assert len(google_provider.calls) == 0


@pytest.mark.asyncio
async def test_google_fallback_is_used_when_vbee_fails() -> None:
    settings = _build_settings(
        AI_GATEWAY_TTS_PRIMARY_PROVIDER="vbee",
        AI_GATEWAY_TTS_ENABLE_FALLBACK=True,
        AI_GATEWAY_TTS_FALLBACK_PROVIDER="google",
    )
    vbee_provider = FakeProvider(
        "vbee",
        error=GatewayError(code="vbee_failed", message="VBee down", status_code=502),
    )
    google_provider = FakeProvider(
        "google_cloud",
        result=TtsResult(
            audio_bytes=b"GOOGLE",
            provider="google_cloud",
            audio_encoding="MP3",
            voice_name="vi-VN-Standard-A",
            language_code="vi-VN",
        ),
    )
    service = TtsGatewayService(
        settings=settings,
        google_provider=google_provider,
        vbee_provider=vbee_provider,
    )

    result = await service.synthesize_speech(
        text="xin chao",
        voice_name="vi-VN-Standard-A",
        language_code="vi-VN",
        audio_encoding="MP3",
        speaking_rate=1.0,
        pitch=0.0,
        request_id="req-2",
    )

    assert result.provider == "google_cloud"
    assert result.fallback_from == "vbee"
    assert len(vbee_provider.calls) == 1
    assert len(google_provider.calls) == 1


@pytest.mark.asyncio
async def test_aggregate_error_is_raised_when_all_tts_providers_fail() -> None:
    settings = _build_settings(
        AI_GATEWAY_TTS_PRIMARY_PROVIDER="vbee",
        AI_GATEWAY_TTS_ENABLE_FALLBACK=True,
        AI_GATEWAY_TTS_FALLBACK_PROVIDER="google",
    )
    service = TtsGatewayService(
        settings=settings,
        google_provider=FakeProvider(
            "google_cloud",
            error=GatewayError(code="google_failed", message="Google down", status_code=502),
        ),
        vbee_provider=FakeProvider(
            "vbee",
            error=GatewayError(code="vbee_failed", message="VBee down", status_code=502),
        ),
    )

    with pytest.raises(GatewayError) as exc_info:
        await service.synthesize_speech(
            text="xin chao",
            voice_name="vi-VN-Standard-A",
            language_code="vi-VN",
            audio_encoding="MP3",
            speaking_rate=1.0,
            pitch=0.0,
            request_id="req-3",
        )

    assert exc_info.value.code == "tts_all_providers_failed"
    assert exc_info.value.details is not None
    assert exc_info.value.details["providerErrors"][0]["provider"] == "vbee"
    assert exc_info.value.details["providerErrors"][1]["provider"] == "google"
