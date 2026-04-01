from typing import Dict, List

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security.dependencies import resolve_child_for_current_actor
from app.modules.children.domain.models import Child
from app.modules.games.application import game_service as service
from app.schemas.schemas import GameSessionPublic, MiniGamePublic

router = APIRouter()


class SubmitGameSessionRequest(BaseModel):
    score: int
    behavior_data: Dict


@router.get("/{child_id}/games", response_model=List[MiniGamePublic])
async def get_games(
    child_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
) -> List[MiniGamePublic]:
    return await service.get_games(child_id=child_id, child=child)


@router.post("/{child_id}/games/{game_id}/start", response_model=GameSessionPublic)
async def start_game(
    child_id: str,
    game_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
) -> GameSessionPublic:
    return await service.start_game(game_id=game_id, child_id=child_id, child=child)


@router.post("/{child_id}/games/sessions/{session_id}/submit", response_model=dict)
async def submit_game_session(
    child_id: str,
    session_id: str,
    request: SubmitGameSessionRequest,
    child: Child = Depends(resolve_child_for_current_actor),
) -> dict:
    return await service.submit_game_session(
        child_id=child_id,
        session_id=session_id,
        score=request.score,
        behavior_data=request.behavior_data,
        child=child,
    )
