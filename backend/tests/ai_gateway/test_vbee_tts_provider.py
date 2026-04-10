from __future__ import annotations

import httpx
import pytest

from ai_gateway.config import GatewaySettings
from ai_gateway.providers.vbee_tts import VbeeTtsProvider


def _build_settings(**overrides) -> GatewaySettings:
    return GatewaySettings(
        SECRET_KEY="test-secret",
        VBEE_TTS_APP_ID="app-id",
        VBEE_TTS_BEARER_TOKEN="bearer-token",
        VBEE_TTS_POLL_INTERVAL_SECONDS=0.0,
        VBEE_TTS_MAX_POLL_ATTEMPTS=3,
        GOOGLE_SERVICE_ACCOUNT_JSON_B64="e30=",
        **overrides,
    )


@pytest.mark.asyncio
async def test_vbee_provider_submits_polls_and_downloads_audio() -> None:
    submit_calls = 0
    poll_calls = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal submit_calls, poll_calls

        if request.method == "POST" and request.url.path == "/api/v1/tts":
            submit_calls += 1
            payload = request.content.decode("utf-8")
            assert "\"app_id\":\"app-id\"" in payload or "\"app_id\": \"app-id\"" in payload
            assert "\"voice_code\":\"n_hanoi_female_thaomaii_children_vc\"" in payload or "\"voice_code\": \"n_hanoi_female_thaomaii_children_vc\"" in payload
            return httpx.Response(
                200,
                json={
                    "status": 1,
                    "result": {
                        "request_id": "req-vbee-123",
                    },
                },
            )

        if request.method == "GET" and request.url.path == "/api/v1/tts/req-vbee-123":
            poll_calls += 1
            if poll_calls == 1:
                return httpx.Response(
                    200,
                    json={
                        "status": 1,
                        "result": {
                            "status": "IN_PROGRESS",
                        },
                    },
                )

            return httpx.Response(
                200,
                json={
                    "status": 1,
                    "result": {
                        "status": "SUCCESS",
                        "audio_link": "https://cdn.vbee.test/audio-123.mp3",
                    },
                },
            )

        if request.method == "GET" and request.url.host == "cdn.vbee.test":
            return httpx.Response(
                200,
                headers={"Content-Type": "audio/mpeg"},
                content=b"ID3FAKEAUDIO",
            )

        raise AssertionError(f"Unexpected request: {request.method} {request.url}")

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport, base_url="https://vbee.vn") as client:
        provider = VbeeTtsProvider(client=client, settings=_build_settings())
        result = await provider.synthesize_speech(
            text="xin chao",
            voice_name="vi-VN-Neural2-A",
            language_code="vi-VN",
            audio_encoding="MP3",
            speaking_rate=1.0,
            pitch=0.0,
            request_id="req-local-1",
        )

    assert submit_calls == 1
    assert poll_calls == 2
    assert result.provider == "vbee"
    assert result.audio_bytes == b"ID3FAKEAUDIO"
    assert result.audio_encoding == "MP3"
    assert result.voice_name == "n_hanoi_female_thaomaii_children_vc"


@pytest.mark.asyncio
async def test_vbee_provider_accepts_explicit_voice_code_from_request() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST" and request.url.path == "/api/v1/tts":
            payload = request.read().decode("utf-8")
            assert "hn_male_vietbach_child_22k-vc" in payload
            return httpx.Response(
                200,
                json={"status": 1, "result": {"request_id": "req-vbee-voice-code"}},
            )

        if request.method == "GET" and request.url.path == "/api/v1/tts/req-vbee-voice-code":
            return httpx.Response(
                200,
                json={
                    "status": 1,
                    "result": {
                        "status": "SUCCESS",
                        "audio_link": "https://cdn.vbee.test/audio-voice.wav",
                    },
                },
            )

        if request.method == "GET" and request.url.host == "cdn.vbee.test":
            return httpx.Response(
                200,
                headers={"Content-Type": "audio/wav"},
                content=b"RIFFFAKEAUDIO",
            )

        raise AssertionError(f"Unexpected request: {request.method} {request.url}")

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport, base_url="https://vbee.vn") as client:
        provider = VbeeTtsProvider(client=client, settings=_build_settings())
        result = await provider.synthesize_speech(
            text="xin chao",
            voice_name="hn_male_vietbach_child_22k-vc",
            language_code="vi-VN",
            audio_encoding="WAV",
            speaking_rate=1.0,
            pitch=0.0,
            request_id="req-local-2",
        )

    assert result.audio_encoding == "WAV"
    assert result.voice_name == "hn_male_vietbach_child_22k-vc"
