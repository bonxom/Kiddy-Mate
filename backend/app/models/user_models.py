from beanie import Document
from pydantic import EmailStr
from datetime import datetime

class User(Document):
    email: EmailStr
    password_hash: str
    full_name: str
    phone_number: str | None = None
    onboarding_completed: bool = False
    notification_settings: dict | None = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime | None = None

    class Settings:
        name = "users"