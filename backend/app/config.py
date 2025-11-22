from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    DATABASE_NAME: str = "kiddy_mate_db"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    GEMINI_API_KEY: Optional[str] = None  
    NCP_API_KEY: Optional[str] = None
    NCP_CLOVASTUDIO_ENDPOINT: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()
