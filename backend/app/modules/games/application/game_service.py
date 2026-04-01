from fastapi import APIRouter, HTTPException, status, Depends
from beanie import Link
from app.modules.games.domain.models import MiniGame
from app.modules.games.domain.models import GameSession
from app.schemas.schemas import MiniGamePublic, GameSessionPublic
from typing import List
from datetime import datetime
from app.core.time import utc_now
from app.shared.query_helpers import extract_id_from_link, extract_id_from_link
from app.modules.children.domain.models import Child

async def get_games(
    child_id: str,
    child: Child = None
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

async def start_game(
    game_id: str,
    child_id: str,
    child: Child = None
):
    game = await MiniGame.get(game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found."
        )
    
    new_session = GameSession(
        game=game,  # type: ignore
        child=child,  # type: ignore
        start_time=utc_now()
    )
    await new_session.insert()
    return GameSessionPublic(
        id=str(new_session.id),
        start_time=new_session.start_time,
        end_time=new_session.end_time,
        score=new_session.score,
        behavior_data=new_session.behavior_data,
    )

async def submit_game_session(
    child_id: str,
    session_id: str,
    score: int,
    behavior_data: dict,
    child: Child = None
):
    session = await GameSession.get(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game session not found."
        )

    link_child_id = extract_id_from_link(session.child)
    if link_child_id != str(child.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this game session."
        )
    
    session.end_time = utc_now()
    session.score = score
    session.behavior_data = behavior_data
    await session.save()
    return {"message": "Game session recorded successfully."}