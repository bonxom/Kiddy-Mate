from app.core.security.child_context import ChildAuthContext, build_child_auth_context
from app.modules.children.application.presenters import to_child_public
from app.modules.children.domain.models import Child
from app.schemas.schemas import ChildPublic


def build_profile_context(child: Child) -> ChildAuthContext:
    return build_child_auth_context(child=child)


async def get_profile(
    child: Child,
    context: ChildAuthContext | None = None,
) -> ChildPublic:
    _ = context or build_profile_context(child)
    return to_child_public(child)
