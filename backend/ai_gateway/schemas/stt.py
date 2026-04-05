from __future__ import annotations

from ai_gateway.schemas.common import RuntimeMetadata


class SttResponsePayload(RuntimeMetadata):
    transcript: str
    confidence: float | None = None
    languageCode: str
