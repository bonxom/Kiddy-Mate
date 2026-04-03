from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    DATABASE_NAME: str = "kiddy_mate_db"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    NAVER_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    CORS_ORIGINS: str = (
        "http://localhost:3000,"
        "http://localhost:5173,"
        "http://localhost:5174,"
        "https://kiddymate.com"
    )

    @property
    def llm_api_key(self) -> Optional[str]:
        return self.OPENAI_API_KEY or self.NAVER_API_KEY

    def get_cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore" 

settings = Settings()
