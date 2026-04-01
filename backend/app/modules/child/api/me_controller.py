from fastapi import APIRouter, Depends

from app.core.security.child_context import ChildAuthContext
from app.core.security.dependencies import get_authenticated_child, require_child_auth_context
from app.modules.child.application import profile_service as service
from app.modules.children.domain.models import Child
from app.schemas.schemas import ChildPublic

router = APIRouter()


@router.get("/me", response_model=ChildPublic)
async def get_me(
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> ChildPublic:
    return await service.get_profile(child=child, context=context)
