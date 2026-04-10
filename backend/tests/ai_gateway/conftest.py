from __future__ import annotations

import os
from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient
from jose import jwt

from ai_gateway.app_factory import create_app
from ai_gateway.config import GatewaySettings

os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("AI_GATEWAY_REQUIRE_AUTH", "true")


class FakeRuntimeService:
    def __init__(self) -> None:
        self.raise_error = None

    async def generate_response(self, **kwargs):
        if self.raise_error:
            raise self.raise_error

        class Value:
            text = f"echo:{kwargs['user_message']}"
            provider = "gemini"
            model = kwargs.get("model_override") or "gemini-2.5-flash"

        class Result:
            value = Value()
            latency_ms = 12

        return Result()

    async def recognize_speech(self, **kwargs):
        if self.raise_error:
            raise self.raise_error

        class Value:
            transcript = "xin chao"
            confidence = 0.98
            provider = "google_cloud"
            language_code = kwargs.get("language_code") or "vi-VN"

        class Result:
            value = Value()
            latency_ms = 23

        return Result()

    async def synthesize_speech(self, **kwargs):
        if self.raise_error:
            raise self.raise_error

        class Value:
            audio_bytes = b"FAKE_MP3"
            provider = "google_cloud"
            audio_encoding = kwargs.get("audio_encoding") or "MP3"
            voice_name = kwargs.get("voice_name") or "vi-VN-Standard-A"
            language_code = kwargs.get("language_code") or "vi-VN"
            fallback_from = None

        class Result:
            value = Value()
            latency_ms = 34

        return Result()


@pytest.fixture
def test_settings() -> GatewaySettings:
    return GatewaySettings(
        SECRET_KEY="test-secret-key",
        ALGORITHM="HS256",
        AI_GATEWAY_REQUIRE_AUTH=True,
        AI_GATEWAY_ALLOWED_ORIGINS="https://kiddymate.netlify.app,https://kiddymate.vercel.app",
        AI_GATEWAY_ALLOWED_ORIGIN_REGEX=r"^https://(?:[a-z0-9-]+--)?kiddymate\.netlify\.app$",
        GEMINI_API_KEY="test-gemini-key",
        GOOGLE_SERVICE_ACCOUNT_JSON_B64="e30=",
    )


@pytest.fixture
def auth_header(test_settings: GatewaySettings) -> dict[str, str]:
    token = jwt.encode(
        {
            "sub": "child-123",
            "child_id": "child-123",
            "child_username": "kidtester",
            "child_name": "Kid Tester",
            "type": "child",
        },
        test_settings.SECRET_KEY,
        algorithm=test_settings.ALGORITHM,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def gateway_client(test_settings: GatewaySettings) -> AsyncIterator[tuple[AsyncClient, FakeRuntimeService]]:
    app = create_app(test_settings)
    fake_service = FakeRuntimeService()

    async with app.router.lifespan_context(app):
        app.state.runtime_service = fake_service
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            yield client, fake_service
