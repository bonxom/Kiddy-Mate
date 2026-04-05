from __future__ import annotations

import io
import os
import wave

import pytest
from httpx import ASGITransport, AsyncClient
from jose import jwt

from ai_gateway.app_factory import create_app
from ai_gateway.config import GatewaySettings


def _should_run_live_smoke() -> bool:
    required = [
        os.getenv("RUN_AI_GATEWAY_LIVE_TESTS"),
        os.getenv("GEMINI_API_KEY"),
        os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON_B64"),
    ]
    return all(required)


@pytest.mark.asyncio
@pytest.mark.skipif(not _should_run_live_smoke(), reason="Live AI gateway smoke test requires opt-in env vars.")
async def test_live_gateway_health_and_llm_smoke():
    settings = GatewaySettings()
    app = create_app(settings)
    token = jwt.encode(
        {
            "sub": "child-live",
            "child_id": "child-live",
            "child_username": "livechild",
            "child_name": "Live Child",
            "type": "child",
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
            health = await client.get("/runtime/v1/health")
            assert health.status_code == 200

            llm = await client.post(
                "/runtime/v1/llm/respond",
                json={"message": "Tra loi mot cau chao ngan gon cho be."},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert llm.status_code == 200
            payload = llm.json()
            assert payload["text"]

            tts = await client.post(
                "/runtime/v1/tts/synthesize",
                json={"text": "Xin chao be nhe", "languageCode": "vi-VN"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert tts.status_code == 200
            assert tts.content
            assert tts.headers["content-type"].startswith("audio/mpeg")

            tts_linear16 = await client.post(
                "/runtime/v1/tts/synthesize",
                json={
                    "text": "Xin chao be",
                    "languageCode": "vi-VN",
                    "audioEncoding": "LINEAR16",
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            assert tts_linear16.status_code == 200
            assert tts_linear16.content

            with wave.open(io.BytesIO(tts_linear16.content), "rb") as wav_file:
                sample_rate_hz = wav_file.getframerate()
                assert sample_rate_hz > 0

            stt = await client.post(
                "/runtime/v1/stt/recognize",
                data={
                    "encoding": "LINEAR16",
                    "sampleRateHertz": str(sample_rate_hz),
                    "languageCode": "vi-VN",
                },
                files={
                    "audio": ("gateway-loopback.wav", tts_linear16.content, "audio/wav"),
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            assert stt.status_code == 200
            stt_payload = stt.json()
            assert stt_payload["transcript"]
            assert "xin" in stt_payload["transcript"].lower()
