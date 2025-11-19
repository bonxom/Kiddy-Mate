from fastapi import APIRouter, HTTPException, status, Depends
from app.models.minigame_models import MiniGame
from app.models.gamesession_models import GameSession
from app.schemas.schemas import MiniGamePublic, GameSessionPublic
from typing import List
from datetime import datetime
from app.dependencies import verify_child_ownership
from app.models.child_models import Child

router = APIRouter()

@router.get("/{child_id}/games", response_model=List[MiniGamePublic])
async def get_games(
    child_id: str,
    child: Child = Depends(verify_child_ownership)
):
    games = await MiniGame.find_all().to_list()
    return [
        MiniGamePublic(
            id=str(g.id),
            name=g.name,
            description=g.description,
            linked_skill=g.linked_skill,
        )
        for g in games
    ]

@router.post("/{child_id}/games/{game_id}/start", response_model=GameSessionPublic)
async def start_game(
    game_id: str,
    child_id: str,
    child: Child = Depends(verify_child_ownership)
):
    game = await MiniGame.get(game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found."
        )
    
    new_session = GameSession(
        game=game,
        child=child,
        start_time=datetime.utcnow()
    )
    await new_session.insert()
    return GameSessionPublic(
        id=str(new_session.id),
        start_time=new_session.start_time,
        end_time=new_session.end_time,
        score=new_session.score,
        behavior_data=new_session.behavior_data,
    )

@router.post("/{child_id}/games/sessions/{session_id}/submit", response_model=dict)
async def submit_game_session(
    child_id: str,
    session_id: str,
    score: int,
    behavior_data: dict,
    child: Child = Depends(verify_child_ownership)
):
    session = await GameSession.get(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game session not found."
        )

    link_child_id = None
    if getattr(session.child, "id", None) is not None:
        link_child_id = str(session.child.id)
    elif getattr(session.child, "ref", None) is not None:
        ref_obj = session.child.ref
        link_child_id = str(getattr(ref_obj, "id", ref_obj))
    if link_child_id != str(child.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this game session."
        )
    
    session.end_time = datetime.utcnow()
    session.score = score
    session.behavior_data = behavior_data
    await session.save()
    return {"message": "Ghi nhận kết quả chơi game thành công."}