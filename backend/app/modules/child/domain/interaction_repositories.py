from __future__ import annotations

from typing import Protocol

from app.modules.children.domain.models import Child
from app.modules.interactions.domain.models import InteractionLog


class ChildInteractionRepository(Protocol):
    async def create_log(self, interaction_log: InteractionLog) -> InteractionLog: ...

    async def list_logs(self, child: Child) -> list[InteractionLog]: ...
