from beanie import Document, Link
from typing import Optional, TYPE_CHECKING
import enum
from datetime import datetime
from pydantic import Field

from app.core.time import utc_now
from app.models.child_models import Child

if TYPE_CHECKING:
    from app.models.user_models import User

class RewardType(str, enum.Enum):
    BADGE = "badge"
    SKIN = "skin"
    ITEM = "item"  

class Reward(Document):
    """Base reward template - can be used for both earned rewards and shop items"""
    name: str
    description: str
    type: RewardType
    image_url: Optional[str] = None
    
    
    cost_coins: int = 0  
    stock_quantity: int = 0  
    is_active: bool = True  
    created_at: datetime = Field(default_factory=utc_now)
    created_by: Optional[Link["User"]] = None  # Track which parent created this reward

    class Settings:
        name = "rewards"

class ChildReward(Document):
    """Rewards owned by a child (either earned from tasks or redeemed from shop)"""
    child: Link[Child]
    reward: Link[Reward]
    earned_at: datetime = Field(default_factory=utc_now)
    is_equipped: bool = False  

    class Settings:
        name = "child_rewards"

class RedemptionRequest(Document):
    """Request from child to redeem a reward using coins"""
    child: Link[Child]
    reward: Link[Reward]
    cost_coins: int
    status: str = "pending"  
    requested_at: datetime = Field(default_factory=utc_now)
    processed_at: Optional[datetime] = None
    processed_by: Optional[str] = None  

    class Settings:
        name = "redemption_requests"
