from beanie import Document, Link
from pydantic import EmailStr
from datetime import datetime
from typing import Optional, TYPE_CHECKING
import enum

if TYPE_CHECKING:
    from app.models.child_models import Child

class UserRole(str, enum.Enum):
    PARENT = "parent"
    CHILD = "child"

class User(Document):
    email: EmailStr
    password_hash: str
    full_name: str
    phone_number: str | None = None
    role: UserRole = UserRole.PARENT  
    child_profile: Optional[Link["Child"]] = None  
    onboarding_completed: bool = False
    notification_settings: dict | None = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime | None = None

    class Settings:
        name = "users"