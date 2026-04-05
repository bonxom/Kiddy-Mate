from __future__ import annotations

import io

import pytest


@pytest.mark.asyncio
async def test_runtime_gateway_e2e_happy_path(gateway_client, auth_header):
    client, _ = gateway_client

    llm_response = await client.post(
        "/runtime/v1/llm/respond",
        json={"message": "be oi", "conversationContext": "ngu canh"},
        headers=auth_header,
    )
    assert llm_response.status_code == 200
    llm_payload = llm_response.json()
    assert llm_payload["text"] == "echo:be oi"

    stt_response = await client.post(
        "/runtime/v1/stt/recognize",
        files={"audio": ("sample.webm", io.BytesIO(b"WEBM"), "audio/webm")},
        data={"encoding": "WEBM_OPUS", "sampleRateHertz": "16000", "languageCode": "vi-VN"},
        headers=auth_header,
    )
    assert stt_response.status_code == 200
    stt_payload = stt_response.json()
    assert stt_payload["transcript"] == "xin chao"

    tts_response = await client.post(
        "/runtime/v1/tts/synthesize",
        json={"text": llm_payload["text"], "languageCode": "vi-VN"},
        headers=auth_header,
    )
    assert tts_response.status_code == 200
    assert tts_response.content == b"FAKE_MP3"
    assert tts_response.headers["x-language-code"] == "vi-VN"
