from beanie import Document, Link
from typing import Optional
import enum
from datetime import datetime
from app.models.child_models import Child

class RewardType(str, enum.Enum):
    BADGE = "badge"
    SKIN = "skin"
    ITEM = "item"  # Physical rewards like toys, books, etc.

class Reward(Document):
    """Base reward template - can be used for both earned rewards and shop items"""
    name: str
    description: str
    type: RewardType
    image_url: Optional[str] = None
    
    # Shop-related fields
    cost_coins: int = 0  # Price in coins (0 means not for sale/already earned)
    stock_quantity: int = 0  # Stock count (0 = unlimited/not tracked)
    is_active: bool = True  # Is available in shop
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "rewards"

class ChildReward(Document):
    """Rewards owned by a child (either earned from tasks or redeemed from shop)"""
    child: Link[Child]
    reward: Link[Reward]
    earned_at: datetime = datetime.utcnow()
    is_equipped: bool = False  # Only applicable for SKIN type

    class Settings:
        name = "child_rewards"

class RedemptionRequest(Document):
    """Request from child to redeem a reward using coins"""
    child: Link[Child]
    reward: Link[Reward]
    cost_coins: int
    status: str = "pending"  # pending, approved, rejected
    requested_at: datetime = datetime.utcnow()
    processed_at: Optional[datetime] = None
    processed_by: Optional[str] = None  # parent user_id

    class Settings:
        name = "redemption_requests"