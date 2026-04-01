from typing import List

from fastapi import APIRouter, Depends

from app.core.security.dependencies import require_parent_principal, resolve_parent_owned_child
from app.modules.ai.application import generation_service as service
from app.modules.children.domain.models import Child
from app.modules.identity.domain.models import User
from app.schemas.schemas import ChildTaskWithDetails

router = APIRouter()


@router.post("/children/{child_id}/generate/chat", response_model=List[ChildTaskWithDetails])
async def generate_tasks(
    child_id: str,
    request: service.GenerateTasksRequest,
    child: Child = Depends(resolve_parent_owned_child),
    current_user: User = Depends(require_parent_principal),
) -> List[ChildTaskWithDetails]:
    return await service.generate_tasks(
        child_id=child_id,
        request=request,
        child=child,
        current_user=current_user,
    )


@router.post("/children/{child_id}/score/chat", response_model=service.ScoreResponse)
async def score_child(
    child_id: str,
    request: service.ScoreRequest,
    child: Child = Depends(resolve_parent_owned_child),
    current_user: User = Depends(require_parent_principal),
) -> service.ScoreResponse:
    return await service.score_child(
        child_id=child_id,
        request=request,
        child=child,
        current_user=current_user,
    )


@router.post("/children/{child_id}/generate/auto", response_model=dict)
async def manual_trigger_auto_generate(
    child_id: str,
    child: Child = Depends(resolve_parent_owned_child),
    current_user: User = Depends(require_parent_principal),
) -> dict:
    return await service.manual_trigger_auto_generate(
        child_id=child_id,
        child=child,
        current_user=current_user,
    )
