from __future__ import annotations

import base64
import json
import re
from functools import lru_cache
from typing import Any

from pydantic_settings import BaseSettings, SettingsConfigDict


DEFAULT_AI_GATEWAY_ALLOWED_ORIGINS = (
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://kiddymate.com",
    "https://kiddymate.vercel.app",
    "https://kiddymate.netlify.app",
)

DEFAULT_AI_GATEWAY_ALLOWED_ORIGIN_REGEX = (
    r"^https://("
    r"kiddymate(?:-[a-z0-9-]+)?(?:-bonxoms-projects)?\.vercel\.app|"
    r"(?:[a-z0-9-]+--)?kiddymate\.netlify\.app"
    r")$"
)

DEFAULT_VBEE_TTS_VOICE_MAP = {
    "vi-VN-Standard-A": "n_hanoi_female_thaomaii_children_vc",
    "vi-VN-Neural2-A": "n_hanoi_female_thaomaii_children_vc",
}


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
    AI_GATEWAY_ALLOWED_ORIGINS: str = ",".join(DEFAULT_AI_GATEWAY_ALLOWED_ORIGINS)
    AI_GATEWAY_ALLOWED_ORIGIN_REGEX: str = DEFAULT_AI_GATEWAY_ALLOWED_ORIGIN_REGEX

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

    AI_GATEWAY_TTS_PRIMARY_PROVIDER: str = "vbee"
    AI_GATEWAY_TTS_ENABLE_FALLBACK: bool = True
    AI_GATEWAY_TTS_FALLBACK_PROVIDER: str = "google"

    VBEE_TTS_BASE_URL: str = "https://vbee.vn/api/v1/tts"
    VBEE_TTS_APP_ID: str | None = None
    VBEE_TTS_BEARER_TOKEN: str | None = None
    VBEE_TTS_CALLBACK_URL: str = "https://kiddymate.invalid/vbee/callback"
    VBEE_TTS_DEFAULT_VOICE_CODE: str = "n_hanoi_female_thaomaii_children_vc"
    VBEE_TTS_VOICE_MAP_JSON: str = json.dumps(DEFAULT_VBEE_TTS_VOICE_MAP, separators=(",", ":"))
    VBEE_TTS_AUDIO_TYPE: str = "mp3"
    VBEE_TTS_BITRATE: int = 128
    VBEE_TTS_SPEED_RATE: float = 1.0
    VBEE_TTS_POLL_INTERVAL_SECONDS: float = 1.0
    VBEE_TTS_MAX_POLL_ATTEMPTS: int = 30

    @property
    def allowed_origins(self) -> list[str]:
        if not self.AI_GATEWAY_ALLOWED_ORIGINS.strip():
            return []
        return [
            origin.strip()
            for origin in self.AI_GATEWAY_ALLOWED_ORIGINS.split(",")
            if origin.strip() and origin.strip() != "*"
        ]

    @property
    def allow_all_origins(self) -> bool:
        if not self.AI_GATEWAY_ALLOWED_ORIGINS.strip():
            return False

        return any(
            origin.strip() == "*"
            for origin in self.AI_GATEWAY_ALLOWED_ORIGINS.split(",")
            if origin.strip()
        )

    def is_origin_allowed(self, origin: str | None) -> bool:
        if not origin:
            return False

        normalized_origin = origin.strip()
        if not normalized_origin:
            return False

        if self.allow_all_origins:
            return True

        if normalized_origin in self.allowed_origins:
            return True

        if self.AI_GATEWAY_ALLOWED_ORIGIN_REGEX:
            return re.match(self.AI_GATEWAY_ALLOWED_ORIGIN_REGEX, normalized_origin) is not None

        return False

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

    @property
    def is_google_stt_configured(self) -> bool:
        return self.google_service_account_info is not None

    @property
    def is_google_tts_configured(self) -> bool:
        return self.google_service_account_info is not None

    @property
    def is_vbee_tts_configured(self) -> bool:
        return bool(
            self.VBEE_TTS_BASE_URL.strip()
            and (self.VBEE_TTS_APP_ID or "").strip()
            and (self.VBEE_TTS_BEARER_TOKEN or "").strip()
        )

    @property
    def vbee_tts_voice_map(self) -> dict[str, str]:
        raw = self.VBEE_TTS_VOICE_MAP_JSON.strip()
        if not raw:
            return {}

        try:
            payload = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ValueError("VBEE_TTS_VOICE_MAP_JSON must be valid JSON.") from exc

        if not isinstance(payload, dict):
            raise ValueError("VBEE_TTS_VOICE_MAP_JSON must decode to a JSON object.")

        return {
            str(key).strip(): str(value).strip()
            for key, value in payload.items()
            if str(key).strip() and str(value).strip()
        }

    @property
    def tts_primary_provider(self) -> str:
        normalized = self.AI_GATEWAY_TTS_PRIMARY_PROVIDER.strip().lower()
        return normalized if normalized in {"vbee", "google"} else "vbee"

    @property
    def tts_fallback_provider(self) -> str | None:
        if not self.AI_GATEWAY_TTS_ENABLE_FALLBACK:
            return None

        normalized = self.AI_GATEWAY_TTS_FALLBACK_PROVIDER.strip().lower()
        if normalized not in {"vbee", "google"}:
            return None
        if normalized == self.tts_primary_provider:
            return None
        return normalized

    @property
    def tts_provider_chain(self) -> list[str]:
        providers = [self.tts_primary_provider]
        fallback_provider = self.tts_fallback_provider
        if fallback_provider:
            providers.append(fallback_provider)
        return providers


@lru_cache(maxsize=1)
def get_settings() -> GatewaySettings:
    return GatewaySettings()
