from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from fastapi.responses import Response

from ai_gateway.auth import AuthenticatedChild, require_authenticated_child
from ai_gateway.config import GatewaySettings
from ai_gateway.dependencies import get_runtime_service, get_settings
from ai_gateway.errors import GatewayError
from ai_gateway.request_context import get_request_id
from ai_gateway.schemas.llm import LlmResponsePayload, LlmResponseRequest
from ai_gateway.schemas.stt import SttResponsePayload
from ai_gateway.schemas.tts import TtsSynthesisRequest
from ai_gateway.services import RuntimeGatewayService

router = APIRouter(prefix="/runtime/v1", tags=["runtime"])


def _media_type_for_audio_encoding(audio_encoding: str) -> str:
    normalized = audio_encoding.strip().upper()
    if normalized in {"MP3", "MPEG"}:
        return "audio/mpeg"
    if normalized in {"WAV", "LINEAR16"}:
        return "audio/wav"
    return "application/octet-stream"


@router.get("/health")
async def health(settings: GatewaySettings = Depends(get_settings)) -> dict[str, object]:
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "authRequired": settings.AI_GATEWAY_REQUIRE_AUTH,
        "providers": {
            "gemini": bool(settings.GEMINI_API_KEY),
            "googleStt": settings.is_google_stt_configured,
            "googleTts": settings.is_google_tts_configured,
            "vbeeTts": settings.is_vbee_tts_configured,
            "ttsPrimary": settings.tts_primary_provider,
            "ttsFallback": settings.tts_fallback_provider,
            "ttsProviderChain": settings.tts_provider_chain,
        },
    }


@router.post("/llm/respond", response_model=LlmResponsePayload)
async def respond_with_llm(
    payload: LlmResponseRequest,
    request: Request,
    child: AuthenticatedChild = Depends(require_authenticated_child),
    runtime_service: RuntimeGatewayService = Depends(get_runtime_service),
) -> LlmResponsePayload:
    request_id = get_request_id(request)
    result = await runtime_service.generate_response(
        user_message=payload.message,
        system_prompt=payload.systemPrompt,
        conversation_context=payload.conversationContext,
        model_override=payload.modelOverride,
        temperature=payload.temperature,
        max_output_tokens=payload.maxOutputTokens,
        request_id=request_id,
        child=child,
    )

    value = result.value
    return LlmResponsePayload(
        requestId=request_id,
        latencyMs=result.latency_ms,
        provider=value.provider,
        model=value.model,
        text=value.text,
    )


@router.post("/stt/recognize", response_model=SttResponsePayload)
async def recognize_speech(
    request: Request,
    audio: UploadFile = File(...),
    encoding: str = Form("LINEAR16"),
    sampleRateHertz: int = Form(16000),
    languageCode: str | None = Form(None),
    sessionId: str | None = Form(None),
    child: AuthenticatedChild = Depends(require_authenticated_child),
    runtime_service: RuntimeGatewayService = Depends(get_runtime_service),
    settings: GatewaySettings = Depends(get_settings),
) -> SttResponsePayload:
    del sessionId
    request_id = get_request_id(request)
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise GatewayError(code="empty_audio", message="Uploaded audio file is empty.")
    if len(audio_bytes) > settings.AI_GATEWAY_MAX_AUDIO_BYTES:
        raise GatewayError(
            code="audio_too_large",
            message="Uploaded audio file exceeds the configured maximum size.",
            status_code=413,
            details={"maxAudioBytes": settings.AI_GATEWAY_MAX_AUDIO_BYTES},
        )

    result = await runtime_service.recognize_speech(
        audio_bytes=audio_bytes,
        encoding=encoding,
        sample_rate_hertz=sampleRateHertz,
        language_code=languageCode,
        request_id=request_id,
        child=child,
    )

    value = result.value
    return SttResponsePayload(
        requestId=request_id,
        latencyMs=result.latency_ms,
        provider=value.provider,
        transcript=value.transcript,
        confidence=value.confidence,
        languageCode=value.language_code,
    )


@router.post("/tts/synthesize")
async def synthesize_speech(
    payload: TtsSynthesisRequest,
    request: Request,
    child: AuthenticatedChild = Depends(require_authenticated_child),
    runtime_service: RuntimeGatewayService = Depends(get_runtime_service),
) -> Response:
    request_id = get_request_id(request)
    result = await runtime_service.synthesize_speech(
        text=payload.text,
        voice_name=payload.voiceName,
        language_code=payload.languageCode,
        audio_encoding=payload.audioEncoding,
        speaking_rate=payload.speakingRate,
        pitch=payload.pitch,
        request_id=request_id,
        child=child,
    )

    value = result.value
    headers = {
        "X-Request-Id": request_id,
        "X-Latency-Ms": str(result.latency_ms),
        "X-Provider": value.provider,
        "X-Audio-Encoding": value.audio_encoding,
        "X-Voice-Name": value.voice_name,
        "X-Language-Code": value.language_code,
    }
    if value.fallback_from:
        headers["X-Tts-Fallback-From"] = value.fallback_from

    return Response(
        content=value.audio_bytes,
        media_type=_media_type_for_audio_encoding(value.audio_encoding),
        headers=headers,
    )
