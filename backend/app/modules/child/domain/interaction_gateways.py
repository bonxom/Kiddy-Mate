from __future__ import annotations

from typing import Protocol


class ChildInteractionGateway(Protocol):
    def generate_avatar_response(self, prompt: str) -> str: ...

    def detect_emotion(self, user_input: str) -> str: ...
