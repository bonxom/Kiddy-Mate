from beanie import Document, Link
from typing import Optional
import enum
from datetime import datetime
from app.models.child_models import Child

class RewardType(str, enum.Enum):
    BADGE = "badge"
    SKIN = "skin"
    COIN = "coin"

class Reward(Document):
    name: str
    description: str
    type: RewardType
    image_url: Optional[str]

    class Settings:
        name = "rewards"

class ChildReward(Document):
    child: Link[Child]
    reward: Link[Reward]
    earned_at: datetime = datetime.utcnow()

    class Settings:
        name = "child_rewards"