from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends

from app.core.security.dependencies import resolve_child_for_current_actor
from app.modules.children.domain.models import Child
from app.modules.interactions.application import interaction_service as service

router = APIRouter()


@router.post("/{child_id}/interact/chat", response_model=dict)
async def interact_with_child(
    child_id: str,
    request: service.ChatRequest,
    child: Child = Depends(resolve_child_for_current_actor),
) -> dict:
    return await service.interact_with_child(
        child_id=child_id,
        request=request,
        child=child,
    )


@router.get("/{child_id}/interact/logs", response_model=Dict[str, List[Dict[str, Any]]])
async def get_interaction_logs(
    child_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
) -> Dict[str, List[Dict[str, Any]]]:
    return await service.get_interaction_logs(child_id=child_id, child=child)


@router.get("/{child_id}/interact/history", response_model=List[Dict[str, Any]])
async def get_interaction_history(
    child_id: str,
    limit: Optional[int] = 20,
    child: Child = Depends(resolve_child_for_current_actor),
) -> List[Dict[str, Any]]:
    return await service.get_interaction_history(
        child_id=child_id,
        limit=limit,
        child=child,
    )
