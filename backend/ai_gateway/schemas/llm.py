from __future__ import annotations

from pydantic import Field

from ai_gateway.schemas.common import GatewayModel, RuntimeMetadata


class LlmResponseRequest(GatewayModel):
    message: str = Field(min_length=1, max_length=12000)
    systemPrompt: str | None = Field(default=None, max_length=24000)
    conversationContext: str | None = Field(default=None, max_length=24000)
    sessionId: str | None = Field(default=None, max_length=128)
    modelOverride: str | None = Field(default=None, max_length=128)
    temperature: float | None = Field(default=None, ge=0.0, le=2.0)
    maxOutputTokens: int | None = Field(default=None, ge=1, le=16384)


class LlmResponsePayload(RuntimeMetadata):
    model: str
    text: str
