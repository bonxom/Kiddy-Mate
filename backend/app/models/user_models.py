from beanie import Document
from pydantic import EmailStr
from datetime import datetime

class User(Document):
    email: EmailStr
    password_hash: str
    full_name: str
    phone_number: str | None = None
    onboarding_completed: bool = False
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "users"