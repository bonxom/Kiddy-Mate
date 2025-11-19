from beanie import Document, Link
from datetime import datetime
from typing import Optional, Dict
from pydantic import Field
from app.models.user_models import User

class Child(Document):
    parent: Link[User]
    name: str
    birth_date: datetime
    initial_traits: Optional[dict]
    current_coins: int = 0
    level: int = 1

    class Settings:
        name = "children"

class ChildDevelopmentAssessment(Document):
    child: Link[Child]
    parent: Link[User]
    discipline_autonomy: Dict[str, Optional[str]]
    emotional_intelligence: Dict[str, Optional[str]]
    social_interaction: Dict[str, Optional[str]]

    class Settings:
        name = "child_development_assessments"
