from beanie import Document, Link
from datetime import datetime
from app.models.child_models import Child
from typing import Optional

class InteractionLog(Document):
    child: Link[Child]
    timestamp: datetime = datetime.utcnow()
    user_input: str
    avatar_response: str
    detected_emotion: Optional[str] = None

    class Settings:
        name = "interaction_logs"