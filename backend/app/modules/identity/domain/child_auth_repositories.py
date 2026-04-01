from __future__ import annotations

from typing import Protocol

from app.modules.children.domain.models import Child


class ChildAuthRepository(Protocol):
    async def get_child_by_username(self, username: str) -> Child | None: ...
