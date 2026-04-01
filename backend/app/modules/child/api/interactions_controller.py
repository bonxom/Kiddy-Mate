from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends

from app.core.security.child_context import ChildAuthContext
from app.core.security.dependencies import get_authenticated_child, require_child_auth_context
from app.modules.child.application import interaction_service as service
from app.modules.children.domain.models import Child

router = APIRouter()


@router.post("/me/interactions/chat", response_model=dict)
async def chat_as_child(
    request: service.ChatRequest,
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> dict:
    return await service.chat(
        request=request,
        child=child,
        context=context,
    )


@router.get("/me/interactions/logs", response_model=Dict[str, List[Dict[str, Any]]])
async def get_my_interaction_logs(
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> Dict[str, List[Dict[str, Any]]]:
    return await service.get_logs(child=child, context=context)


@router.get("/me/interactions/history", response_model=List[Dict[str, Any]])
async def get_my_interaction_history(
    limit: Optional[int] = 20,
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> List[Dict[str, Any]]:
    return await service.get_history(child=child, limit=limit, context=context)
