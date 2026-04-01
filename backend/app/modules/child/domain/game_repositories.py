from __future__ import annotations

from typing import Protocol

from app.modules.games.domain.models import GameSession, MiniGame


class ChildGameRepository(Protocol):
    async def list_games(self) -> list[MiniGame]: ...

    async def get_game(self, game_id: str) -> MiniGame | None: ...

    async def create_session(self, session: GameSession) -> GameSession: ...

    async def get_session(self, session_id: str) -> GameSession | None: ...

    async def save_session(self, session: GameSession) -> GameSession: ...
