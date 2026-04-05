from __future__ import annotations

import base64
import json
from functools import lru_cache
from typing import Any

from pydantic_settings import BaseSettings, SettingsConfigDict


class GatewaySettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "KiddyMate AI Gateway"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8100
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    AI_GATEWAY_REQUIRE_AUTH: bool = True
    AI_GATEWAY_LOG_LEVEL: str = "INFO"
    AI_GATEWAY_HTTP_TIMEOUT_SECONDS: float = 20.0
    AI_GATEWAY_MAX_RETRIES: int = 1
    AI_GATEWAY_RETRY_BACKOFF_SECONDS: float = 0.5
    AI_GATEWAY_MAX_AUDIO_BYTES: int = 6_000_000
    AI_GATEWAY_ALLOWED_ORIGINS: str = "*"

    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TEMPERATURE: float = 0.7
    GEMINI_MAX_OUTPUT_TOKENS: int = 4000

    GOOGLE_SERVICE_ACCOUNT_JSON_B64: str | None = None
    GOOGLE_CLOUD_PROJECT_ID: str | None = None
    GOOGLE_STT_LANGUAGE_CODE: str = "vi-VN"
    GOOGLE_TTS_VOICE_NAME: str = "vi-VN-Standard-A"
    GOOGLE_TTS_LANGUAGE_CODE: str = "vi-VN"
    GOOGLE_TTS_AUDIO_ENCODING: str = "MP3"
    GOOGLE_TTS_SPEAKING_RATE: float = 1.0
    GOOGLE_TTS_PITCH: float = 0.0

    @property
    def allowed_origins(self) -> list[str]:
        if not self.AI_GATEWAY_ALLOWED_ORIGINS.strip():
            return []
        return [origin.strip() for origin in self.AI_GATEWAY_ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def google_service_account_info(self) -> dict[str, Any] | None:
        if not self.GOOGLE_SERVICE_ACCOUNT_JSON_B64:
            return None

        raw = self.GOOGLE_SERVICE_ACCOUNT_JSON_B64.strip()
        padding = "=" * (-len(raw) % 4)
        decoded = base64.b64decode(raw + padding)
        payload = json.loads(decoded.decode("utf-8"))
        if not isinstance(payload, dict):
            raise ValueError("GOOGLE_SERVICE_ACCOUNT_JSON_B64 did not decode to a JSON object.")
        return payload


@lru_cache(maxsize=1)
def get_settings() -> GatewaySettings:
    return GatewaySettings()
