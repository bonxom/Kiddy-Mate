from __future__ import annotations

from app.modules.children.domain.models import Child
from app.modules.identity.domain.child_auth_repositories import ChildAuthRepository


class BeanieChildAuthRepository(ChildAuthRepository):
    async def get_child_by_username(self, username: str) -> Child | None:
        return await Child.find_one(Child.username == username)
