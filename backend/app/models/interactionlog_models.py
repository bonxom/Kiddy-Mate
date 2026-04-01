from beanie import Document, Link
from datetime import datetime
from app.models.child_models import Child
from typing import Optional
from pydantic import Field

from app.core.time import utc_now

class InteractionLog(Document):
    child: Link[Child]
    timestamp: datetime = Field(default_factory=utc_now)
    user_input: str
    avatar_response: str
    detected_emotion: Optional[str] = None

    class Settings:
        name = "interaction_logs"
