from __future__ import annotations

from app.modules.child.domain.interaction_repositories import ChildInteractionRepository
from app.modules.children.domain.models import Child
from app.modules.interactions.domain.models import InteractionLog
from app.shared.query_helpers import extract_id_from_link


class BeanieChildInteractionRepository(ChildInteractionRepository):
    async def create_log(self, interaction_log: InteractionLog) -> InteractionLog:
        await interaction_log.insert()
        return interaction_log

    async def list_logs(self, child: Child) -> list[InteractionLog]:
        logs = await InteractionLog.find_all().to_list()
        return [
            log
            for log in logs
            if extract_id_from_link(log.child) == str(child.id)
        ]
