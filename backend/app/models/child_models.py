from beanie import Document, Link
from datetime import datetime
from typing import Optional, Dict, List
from pydantic import Field
from app.models.user_models import User

class Child(Document):
    parent: Link[User]
    name: str
    birth_date: datetime
    username: Optional[str] = None  # Unique username for child login
    password_hash: Optional[str] = None  # Hashed password for child login
    nickname: Optional[str] = None
    gender: Optional[str] = None
    avatar_url: Optional[str] = None
    
    personality: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    strengths: Optional[List[str]] = None
    challenges: Optional[List[str]] = None
    initial_traits: Optional[dict] = None
    
    current_coins: int = 0
    level: int = 1
    last_auto_generated_at: Optional[datetime] = None  # Track last auto-generation time

    class Settings:
        name = "children"

class ChildDevelopmentAssessment(Document):
    child: Link[Child]
    parent: Link[User]
    discipline_autonomy: Dict[str, Optional[str]]
    emotional_intelligence: Dict[str, Optional[str]]
    social_interaction: Dict[str, Optional[str]]
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "child_development_assessments"
