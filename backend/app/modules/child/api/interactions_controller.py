from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends

from app.core.security.dependencies import get_authenticated_child
from app.modules.children.domain.models import Child
from app.modules.interactions.application import interaction_service as service

router = APIRouter()


@router.post("/me/interactions/chat", response_model=dict)
async def chat_as_child(
    request: service.ChatRequest,
    child: Child = Depends(get_authenticated_child),
) -> dict:
    return await service.interact_with_child(
        child_id=str(child.id),
        request=request,
        child=child,
    )


@router.get("/me/interactions/logs", response_model=Dict[str, List[Dict[str, Any]]])
async def get_my_interaction_logs(
    child: Child = Depends(get_authenticated_child),
) -> Dict[str, List[Dict[str, Any]]]:
    return await service.get_interaction_logs(
        child_id=str(child.id),
        child=child,
    )


@router.get("/me/interactions/history", response_model=List[Dict[str, Any]])
async def get_my_interaction_history(
    limit: Optional[int] = 20,
    child: Child = Depends(get_authenticated_child),
) -> List[Dict[str, Any]]:
    return await service.get_interaction_history(
        child_id=str(child.id),
        limit=limit,
        child=child,
    )
