from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.models.child_models import Child
from app.models.user_models import User


@dataclass(frozen=True)
class ChildAuthContext:
    child_id: str
    username: str | None
    display_name: str
    principal_user_id: str | None = None
    principal_email: str | None = None
    principal_type: str = "child"


def build_child_auth_context(
    child: Child,
    principal: User | None = None,
) -> ChildAuthContext:
    return ChildAuthContext(
        child_id=str(child.id),
        username=child.username,
        display_name=child.nickname or child.name,
        principal_user_id=str(principal.id) if principal and principal.id is not None else None,
        principal_email=principal.email if principal else None,
    )


def child_context_to_token_claims(context: ChildAuthContext) -> dict[str, Any]:
    return {
        "sub": context.child_id,
        "type": "child",
        "child_id": context.child_id,
        "child_username": context.username,
        "child_name": context.display_name,
    }
