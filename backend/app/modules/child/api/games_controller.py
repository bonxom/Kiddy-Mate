from typing import Dict

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security.dependencies import get_authenticated_child
from app.modules.children.domain.models import Child
from app.modules.games.application import game_service as service
from app.schemas.schemas import GameSessionPublic, MiniGamePublic

router = APIRouter()


class SubmitGameSessionRequest(BaseModel):
    score: int
    behavior_data: Dict


@router.get("/me/games", response_model=list[MiniGamePublic])
async def get_my_games(
    child: Child = Depends(get_authenticated_child),
) -> list[MiniGamePublic]:
    return await service.get_games(
        child_id=str(child.id),
        child=child,
    )


@router.post("/me/games/{game_id}/start", response_model=GameSessionPublic)
async def start_my_game(
    game_id: str,
    child: Child = Depends(get_authenticated_child),
) -> GameSessionPublic:
    return await service.start_game(
        game_id=game_id,
        child_id=str(child.id),
        child=child,
    )


@router.post("/me/games/sessions/{session_id}/submit", response_model=dict)
async def submit_my_game_session(
    session_id: str,
    request: SubmitGameSessionRequest,
    child: Child = Depends(get_authenticated_child),
) -> dict:
    return await service.submit_game_session(
        child_id=str(child.id),
        session_id=session_id,
        score=request.score,
        behavior_data=request.behavior_data,
        child=child,
    )
