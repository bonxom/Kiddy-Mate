from __future__ import annotations

from typing import Any

from pydantic import BaseModel

from app.core.security.child_context import ChildAuthContext, build_child_auth_context
from app.core.time import utc_now
from app.modules.child.domain.errors import ChildForbiddenError, ChildNotFoundError
from app.modules.child.domain.game_repositories import ChildGameRepository
from app.modules.child.infrastructure.game_repository import BeanieChildGameRepository
from app.modules.children.domain.models import Child
from app.modules.games.domain.models import GameSession
from app.schemas.schemas import GameSessionPublic, MiniGamePublic
from app.shared.query_helpers import extract_id_from_link


class SubmitGameSessionRequest(BaseModel):
    score: int
    behavior_data: dict[str, Any]


def _child_context(child: Child) -> ChildAuthContext:
    return build_child_auth_context(child=child)


def _repository(repository: ChildGameRepository | None = None) -> ChildGameRepository:
    return repository or BeanieChildGameRepository()


async def list_games(
    child: Child,
    context: ChildAuthContext | None = None,
    repository: ChildGameRepository | None = None,
) -> list[MiniGamePublic]:
    _ = context or _child_context(child)
    repo = _repository(repository)
    games = await repo.list_games()
    return [
        MiniGamePublic(
            id=str(game.id),
            name=game.name,
            description=game.description,
            linked_skill=game.linked_skill,
        )
        for game in games
    ]


async def start_game(
    game_id: str,
    child: Child,
    context: ChildAuthContext | None = None,
    repository: ChildGameRepository | None = None,
) -> GameSessionPublic:
    _ = context or _child_context(child)
    repo = _repository(repository)
    game = await repo.get_game(game_id)
    if not game:
        raise ChildNotFoundError("Game not found.")

    session = GameSession(
        game=game,  # type: ignore[arg-type]
        child=child,  # type: ignore[arg-type]
        start_time=utc_now(),
    )
    session = await repo.create_session(session)
    return GameSessionPublic(
        id=str(session.id),
        start_time=session.start_time,
        end_time=session.end_time,
        score=session.score,
        behavior_data=session.behavior_data,
    )


async def submit_game_session(
    session_id: str,
    request: SubmitGameSessionRequest,
    child: Child,
    context: ChildAuthContext | None = None,
    repository: ChildGameRepository | None = None,
) -> dict:
    _ = context or _child_context(child)
    repo = _repository(repository)
    session = await repo.get_session(session_id)
    if not session:
        raise ChildNotFoundError("Game session not found.")
    if extract_id_from_link(session.child) != str(child.id):
        raise ChildForbiddenError("You do not own this game session.")

    session.end_time = utc_now()
    session.score = request.score
    session.behavior_data = request.behavior_data
    await repo.save_session(session)
    return {"message": "Game session recorded successfully."}
