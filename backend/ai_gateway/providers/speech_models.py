from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class SttResult:
    transcript: str
    confidence: float | None
    provider: str
    language_code: str


@dataclass(slots=True)
class TtsResult:
    audio_bytes: bytes
    provider: str
    audio_encoding: str
    voice_name: str
    language_code: str
    fallback_from: str | None = None
