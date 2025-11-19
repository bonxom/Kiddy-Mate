from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.beanie_models import (
    User, Child, ChildDevelopmentAssessment, Task, Reward, ChildReward, MiniGame,
    GameSession, InteractionLog, Report, ChildTask
)
from app.config import settings

client = AsyncIOMotorClient(settings.DATABASE_URL)
db = client[settings.DATABASE_NAME]

async def init_database():
    await init_beanie(database=db, document_models=[
        User,
        Child,
        ChildDevelopmentAssessment,
        Task,
        Reward,
        ChildReward,
        MiniGame,
        GameSession,
        InteractionLog,
        Report,
        ChildTask
    ])
