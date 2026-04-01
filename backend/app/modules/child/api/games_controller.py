from typing import Dict

from fastapi import APIRouter, Depends

from app.core.security.child_context import ChildAuthContext
from app.core.security.dependencies import get_authenticated_child, require_child_auth_context
from app.modules.child.application import game_service as service
from app.modules.children.domain.models import Child
from app.schemas.schemas import GameSessionPublic, MiniGamePublic

router = APIRouter()


@router.get("/me/games", response_model=list[MiniGamePublic])
async def get_my_games(
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> list[MiniGamePublic]:
    return await service.list_games(child=child, context=context)


@router.post("/me/games/{game_id}/start", response_model=GameSessionPublic)
async def start_my_game(
    game_id: str,
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> GameSessionPublic:
    return await service.start_game(
        game_id=game_id,
        child=child,
        context=context,
    )


@router.post("/me/games/sessions/{session_id}/submit", response_model=dict)
async def submit_my_game_session(
    session_id: str,
    request: service.SubmitGameSessionRequest,
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> dict:
    return await service.submit_game_session(
        session_id=session_id,
        request=request,
        child=child,
        context=context,
    )
