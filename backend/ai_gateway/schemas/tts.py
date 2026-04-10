from __future__ import annotations

from pydantic import Field

from ai_gateway.schemas.common import GatewayModel


class TtsSynthesisRequest(GatewayModel):
    text: str = Field(min_length=1, max_length=5000)
    sessionId: str | None = Field(default=None, max_length=128)
    voiceName: str | None = Field(default=None, max_length=128)
    languageCode: str | None = Field(default=None, max_length=32)
    audioEncoding: str | None = Field(default=None, max_length=16)
    speakingRate: float | None = Field(default=None, ge=0.25, le=4.0)
    pitch: float | None = Field(default=None, ge=-20.0, le=20.0)
