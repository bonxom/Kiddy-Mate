from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from beanie import init_beanie
import certifi
from app.models.beanie_models import (
    User, Child, ChildDevelopmentAssessment, Task, Reward, ChildReward, RedemptionRequest, MiniGame,
    GameSession, InteractionLog, Report, ChildTask
)
from app.config import settings

client_kwargs = {}
database_url = settings.DATABASE_URL
if database_url.startswith("mongodb+srv://") or "tls=true" in database_url.lower() or "ssl=true" in database_url.lower():
    client_kwargs["tlsCAFile"] = certifi.where()

client = AsyncIOMotorClient(database_url, **client_kwargs)


def _patch_motor_append_metadata(motor_client: AsyncIOMotorClient) -> None:
    """
    Beanie 2.1.x expects `database.client.append_metadata(...)` to exist.
    Motor does not expose this method and instead treats the attribute access
    as database lookup, returning an `AsyncIOMotorDatabase` object.

    Patch the Motor client to forward the underlying PyMongo delegate method
    when available so Beanie startup can proceed normally.
    """
    append_metadata = getattr(motor_client, "append_metadata", None)
    if isinstance(append_metadata, AsyncIOMotorDatabase):
        delegate = getattr(motor_client, "delegate", None)
        delegate_append_metadata = getattr(delegate, "append_metadata", None)
        if callable(delegate_append_metadata):
            motor_client.append_metadata = delegate_append_metadata  # type: ignore[attr-defined]


_patch_motor_append_metadata(client)
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
