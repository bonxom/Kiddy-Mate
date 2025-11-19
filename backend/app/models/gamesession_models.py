from beanie import Document, Link
from datetime import datetime
from typing import Optional, Dict
from app.models.child_models import Child
from app.models.minigame_models import MiniGame

class GameSession(Document):
    child: Link[Child]
    game: Link[MiniGame]
    start_time: datetime = datetime.utcnow()
    end_time: Optional[datetime] = None
    score: Optional[int] = None
    behavior_data: Optional[Dict] = None

    class Settings:
        name = "game_sessions"