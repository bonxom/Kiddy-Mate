from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str
    DATABASE_NAME: str = "kiddy_mate_db"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    NCP_API_KEY: Optional[str] = None
    NCP_CLOVASTUDIO_ENDPOINT: Optional[str] = None
    NAVER_API_KEY: Optional[str] = None

    def model_post_init(self, __context) -> None:
        if self.NAVER_API_KEY is None and self.NCP_API_KEY:
            self.NAVER_API_KEY = self.NCP_API_KEY

settings = Settings()
