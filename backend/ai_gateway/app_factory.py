from __future__ import annotations

from contextlib import asynccontextmanager
import logging

import httpx
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from ai_gateway.auth import JwtAuthMiddleware
from ai_gateway.config import GatewaySettings, get_settings
from ai_gateway.errors import GatewayError, gateway_error_handler, unhandled_exception_handler, validation_error_handler
from ai_gateway.logging_utils import configure_logging
from ai_gateway.request_context import RequestContextMiddleware

logger = logging.getLogger("ai_gateway.app")


def create_app(settings: GatewaySettings | None = None) -> FastAPI:
    from ai_gateway.providers import GeminiProvider, GoogleSpeechProvider, VbeeTtsProvider
    from ai_gateway.routes import router as runtime_router
    from ai_gateway.services import RuntimeGatewayService, TtsGatewayService

    settings = settings or get_settings()
    configure_logging(settings.AI_GATEWAY_LOG_LEVEL)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        async with httpx.AsyncClient(timeout=settings.AI_GATEWAY_HTTP_TIMEOUT_SECONDS) as client:
            app.state.gateway_settings = settings
            google_speech_provider = GoogleSpeechProvider(client=client, settings=settings)
            app.state.runtime_service = RuntimeGatewayService(
                gemini_provider=GeminiProvider(client=client, settings=settings),
                google_speech_provider=google_speech_provider,
                tts_service=TtsGatewayService(
                    settings=settings,
                    google_provider=google_speech_provider,
                    vbee_provider=VbeeTtsProvider(client=client, settings=settings),
                ),
            )
            logger.info("AI gateway runtime initialized on port %s", settings.APP_PORT)
            yield

    app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)
    app.add_exception_handler(GatewayError, gateway_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)

    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(JwtAuthMiddleware, settings=settings)

    if settings.allow_all_origins or settings.allowed_origins or settings.AI_GATEWAY_ALLOWED_ORIGIN_REGEX:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.allowed_origins,
            allow_origin_regex=".*" if settings.allow_all_origins else settings.AI_GATEWAY_ALLOWED_ORIGIN_REGEX,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
            expose_headers=[
                "X-Request-Id",
                "X-Process-Time-Ms",
                "X-Latency-Ms",
                "X-Provider",
                "X-Audio-Encoding",
                "X-Voice-Name",
                "X-Language-Code",
                "X-Tts-Fallback-From",
                "WWW-Authenticate",
            ],
        )

    app.include_router(runtime_router)
    return app
