from __future__ import annotations

import io

import pytest

from ai_gateway.errors import GatewayError


@pytest.mark.asyncio
async def test_llm_endpoint_returns_gateway_metadata(gateway_client, auth_header):
    client, _ = gateway_client
    response = await client.post(
        "/runtime/v1/llm/respond",
        json={"message": "xin chao", "systemPrompt": "ban la KiddyMate"},
        headers=auth_header,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["text"] == "echo:xin chao"
    assert data["provider"] == "gemini"
    assert data["requestId"]
    assert data["latencyMs"] == 12


@pytest.mark.asyncio
async def test_stt_endpoint_accepts_audio_upload(gateway_client, auth_header):
    client, _ = gateway_client
    response = await client.post(
        "/runtime/v1/stt/recognize",
        files={"audio": ("sample.wav", io.BytesIO(b"RIFF...."), "audio/wav")},
        data={"encoding": "LINEAR16", "sampleRateHertz": "16000", "languageCode": "vi-VN"},
        headers=auth_header,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["transcript"] == "xin chao"
    assert data["provider"] == "google_cloud"
    assert data["languageCode"] == "vi-VN"


@pytest.mark.asyncio
async def test_tts_endpoint_returns_audio_bytes_with_metadata_headers(gateway_client, auth_header):
    client, _ = gateway_client
    response = await client.post(
        "/runtime/v1/tts/synthesize",
        json={"text": "xin chao", "voiceName": "vi-VN-Standard-A"},
        headers=auth_header,
    )

    assert response.status_code == 200
    assert response.content == b"FAKE_MP3"
    assert response.headers["content-type"].startswith("audio/mpeg")
    assert response.headers["x-provider"] == "google_cloud"
    assert response.headers["x-request-id"]


@pytest.mark.asyncio
async def test_runtime_endpoints_require_bearer_token(gateway_client):
    client, _ = gateway_client
    response = await client.post("/runtime/v1/llm/respond", json={"message": "hello"})

    assert response.status_code == 401
    payload = response.json()
    assert payload["error"]["code"] == "missing_bearer_token"


@pytest.mark.asyncio
async def test_runtime_unauthorized_responses_preserve_cors_headers(gateway_client):
    client, _ = gateway_client
    response = await client.post(
        "/runtime/v1/tts/synthesize",
        json={"text": "xin chao", "voiceName": "vi-VN-Standard-A"},
        headers={"Origin": "https://kiddymate.netlify.app"},
    )

    assert response.status_code == 401
    assert response.headers["access-control-allow-origin"] == "https://kiddymate.netlify.app"
    assert response.headers["access-control-allow-credentials"] == "true"
    assert response.json()["error"]["code"] == "missing_bearer_token"


@pytest.mark.asyncio
async def test_runtime_preflight_allows_netlify_origin(gateway_client):
    client, _ = gateway_client
    response = await client.options(
        "/runtime/v1/tts/synthesize",
        headers={
            "Origin": "https://kiddymate.netlify.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,authorization",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://kiddymate.netlify.app"


@pytest.mark.asyncio
async def test_gateway_errors_are_standardized(gateway_client, auth_header):
    client, fake_service = gateway_client
    fake_service.raise_error = GatewayError(code="provider_down", message="Gateway provider failed.", status_code=503)

    response = await client.post(
        "/runtime/v1/llm/respond",
        json={"message": "hello"},
        headers=auth_header,
    )

    assert response.status_code == 503
    payload = response.json()
    assert payload["error"]["code"] == "provider_down"
    assert payload["requestId"]
