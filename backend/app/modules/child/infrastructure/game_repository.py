from __future__ import annotations

from app.modules.child.domain.game_repositories import ChildGameRepository
from app.modules.games.domain.models import GameSession, MiniGame


class BeanieChildGameRepository(ChildGameRepository):
    async def list_games(self) -> list[MiniGame]:
        return await MiniGame.find_all().to_list()

    async def get_game(self, game_id: str) -> MiniGame | None:
        return await MiniGame.get(game_id)

    async def create_session(self, session: GameSession) -> GameSession:
        await session.insert()
        return session

    async def get_session(self, session_id: str) -> GameSession | None:
        return await GameSession.get(session_id)

    async def save_session(self, session: GameSession) -> GameSession:
        await session.save()
        return session
