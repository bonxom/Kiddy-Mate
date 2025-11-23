from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.beanie_models import (
    User, Child, ChildDevelopmentAssessment, Task, Reward, ChildReward, RedemptionRequest, MiniGame,
    GameSession, InteractionLog, Report, ChildTask
)
from app.config import settings

client = AsyncIOMotorClient(settings.DATABASE_URL)
db = client[settings.DATABASE_NAME]

async def init_database():
    """
    Initialize database connection and Beanie models.
    Rebuilds User model to resolve forward reference to Child.
    Rebuilds Reward model to resolve forward reference to User.
    """
    
    from app.models.child_models import Child
    from app.models.user_models import User
    from app.models.reward_models import Reward
    
    
    User.model_rebuild()
    # Rebuild Reward after User is defined to resolve forward reference
    Reward.model_rebuild()
    
    await init_beanie(database=db, document_models=[
        User,
        Child,
        ChildDevelopmentAssessment,
        Task,
        Reward,
        ChildReward,
        RedemptionRequest,
        MiniGame,
        GameSession,
        InteractionLog,
        Report,
        ChildTask
    ])
