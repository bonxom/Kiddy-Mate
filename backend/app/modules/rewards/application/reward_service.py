from fastapi import APIRouter, HTTPException, status, Depends, Query
from beanie import Link
from app.modules.rewards.domain.models import Reward, RewardType, ChildReward, RedemptionRequest
from app.modules.children.domain.models import Child
from app.modules.identity.domain.models import User
from app.shared.query_helpers import verify_reward_ownership, get_user_children, extract_id_from_link, fetch_link_or_get_object
from typing import List, Optional
from datetime import datetime
from app.core.time import utc_now
from pydantic import BaseModel

class RewardCreate(BaseModel):
    name: str
    description: str
    type: RewardType
    image_url: Optional[str] = None
    cost_coins: int
    stock_quantity: int = 0
    is_active: bool = True

class RewardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[RewardType] = None  # Allow updating reward type
    image_url: Optional[str] = None
    cost_coins: Optional[int] = None
    stock_quantity: Optional[int] = None
    is_active: Optional[bool] = None

class RedemptionRequestCreate(BaseModel):
    reward_id: str

async def get_all_rewards(
    is_active: Optional[bool] = None,
    type: Optional[RewardType] = None,
    current_user: User = None
):
    """
    Get all rewards in shop created by the current user (for parents to manage)
    Query params: is_active, type
    """
    query_dict = {}
    if is_active is not None:
        query_dict["is_active"] = is_active
    if type is not None:
        query_dict["type"] = type
    
    # Filter rewards by created_by (only show rewards created by current user)
    all_rewards = await Reward.find(query_dict).to_list()
    current_user_id = str(current_user.id)
    
    filtered_rewards = []
    for r in all_rewards:
        # Only include rewards created by current user
        if r.created_by is not None:
            created_by_id = extract_id_from_link(r.created_by)
            if created_by_id == current_user_id:
                filtered_rewards.append(r)
    
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "description": r.description,
            "type": r.type,
            "url_thumbnail": r.image_url,  
            "cost": r.cost_coins,           
            "remain": r.stock_quantity,     
            "is_active": r.is_active,
        }
        for r in filtered_rewards
    ]

async def create_reward(
    reward_data: RewardCreate,
    current_user: User = None
):
    """Create new reward (parent only)"""
    reward = Reward(
        name=reward_data.name,
        description=reward_data.description,
        type=reward_data.type,
        image_url=reward_data.image_url,
        cost_coins=reward_data.cost_coins,
        stock_quantity=reward_data.stock_quantity,
        is_active=reward_data.is_active,
        created_by=Link(current_user, User),  # Track who created this reward
    )
    await reward.insert()
    
    return {
        "id": str(reward.id),
        "name": reward.name,
        "description": reward.description,
        "type": reward.type,
        "url_thumbnail": reward.image_url,
        "cost": reward.cost_coins,
        "remain": reward.stock_quantity,
        "is_active": reward.is_active,
    }

async def update_reward(
    reward_id: str,
    reward_update: RewardUpdate,
    current_user: User = None
):
    """Update reward (parent only) - only owner can update"""
    # Verify ownership
    reward = await verify_reward_ownership(reward_id, current_user)
    
    if reward_update.name is not None:
        reward.name = reward_update.name
    if reward_update.description is not None:
        reward.description = reward_update.description
    if reward_update.type is not None:
        reward.type = reward_update.type
    if reward_update.image_url is not None:
        reward.image_url = reward_update.image_url
    if reward_update.cost_coins is not None:
        reward.cost_coins = reward_update.cost_coins
    if reward_update.stock_quantity is not None:
        reward.stock_quantity = reward_update.stock_quantity
    if reward_update.is_active is not None:
        reward.is_active = reward_update.is_active
    
    await reward.save()
    
    return {
        "id": str(reward.id),
        "name": reward.name,
        "description": reward.description,
        "type": reward.type,
        "url_thumbnail": reward.image_url,
        "cost": reward.cost_coins,
        "remain": reward.stock_quantity,
        "is_active": reward.is_active,
    }

async def delete_reward(
    reward_id: str,
    current_user: User = None
):
    """Delete reward (parent only) - only owner can delete"""
    # Verify ownership
    reward = await verify_reward_ownership(reward_id, current_user)
    
    await reward.delete()
    return None

async def update_reward_quantity(
    reward_id: str,
    delta: int = None,
    current_user: User = None
):
    """Update reward stock quantity (parent only) - only owner can update"""
    # Verify ownership
    reward = await verify_reward_ownership(reward_id, current_user)
    
    reward.stock_quantity = max(0, reward.stock_quantity + delta)
    await reward.save()
    
    return {
        "id": str(reward.id),
        "remain": reward.stock_quantity,
    }

async def request_redemption(
    child_id: str,
    request_data: RedemptionRequestCreate,
    child: Child = None
):
    """Child requests to redeem a reward - verify reward belongs to child's parent"""
    reward = await Reward.get(request_data.reward_id)
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found"
        )
    
    if not reward.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reward is not available"
        )
    
    # Verify reward belongs to child's parent (or allow if created_by is None for backward compatibility)
    if reward.created_by is not None:
        child_parent = await fetch_link_or_get_object(child.parent, User)  # type: ignore[arg-type]
        if not child_parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent account not found for this child",
            )
        child_parent_id = str(child_parent.id)
        reward_owner_id = extract_id_from_link(reward.created_by)
        if not reward_owner_id or reward_owner_id != child_parent_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: This reward does not belong to your parent"
            )
    
    # Check stock (0 = unlimited, >0 = limited stock)
    # If stock is being tracked (>0 initially) but now depleted
    if reward.stock_quantity == 0 and reward.cost_coins > 0:
        # For shop items (cost > 0), stock_quantity 0 likely means out of stock
        # But to maintain backward compatibility, we allow unlimited items
        pass  # Allow redemption even if stock is 0 (unlimited items)
    # Note: Stock will be decremented in approve_redemption if stock_quantity > 0    
    
    if child.current_coins < reward.cost_coins:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient coins. Need {reward.cost_coins}, have {child.current_coins}"
        )
    
    
    redemption = RedemptionRequest(
        child=child,  # type: ignore
        reward=reward,  # type: ignore
        cost_coins=reward.cost_coins,
    )
    await redemption.insert()
    
    return {
        "id": str(redemption.id),
        "message": "Redemption request created. Waiting for parent approval.",
        "cost": reward.cost_coins,
    }

async def get_redemption_requests(
    status_filter: Optional[str] = None,
    current_user: User = None
):
    """Get all redemption requests for children owned by current user (parent only)"""
    query_dict = {}
    if status_filter:
        query_dict["status"] = status_filter
    
    # Get all children owned by current user
    user_children = await get_user_children(current_user)
    user_children_ids = {str(child.id) for child in user_children}
    
    # Get all redemption requests
    all_requests = await RedemptionRequest.find(query_dict).sort("-requested_at").to_list()
    
    # Filter requests to only include those from user's children
    results = []
    for req in all_requests:
        # Safely fetch child from Link
        child = await fetch_link_or_get_object(req.child, Child)
        if not child:
            continue  # Skip if child not found
        
        child_id = str(child.id)
        
        # Only include if child belongs to current user
        if child_id in user_children_ids:
            # Safely fetch reward from Link
            reward = await fetch_link_or_get_object(req.reward, Reward)
            if not reward:
                continue  # Skip if reward not found
            
            results.append({
                "id": str(req.id),
                "child": child.name,
                "childId": child_id,
                "rewardName": reward.name,
                "rewardId": str(reward.id),
                "dateCreated": req.requested_at.strftime("%Y-%m-%d"),
                "cost": req.cost_coins,
                "status": req.status,
            })
    
    return results

async def approve_redemption(
    request_id: str,
    current_user: User = None
):
    """Approve redemption request (parent only) - verify child and reward ownership"""
    redemption = await RedemptionRequest.get(request_id)
    if not redemption:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Redemption request not found"
        )
    
    if redemption.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request already {redemption.status}"
        )
    
    # Safely fetch child and reward from Links
    child = await fetch_link_or_get_object(redemption.child, Child)
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )
    
    reward = await fetch_link_or_get_object(redemption.reward, Reward)
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found"
        )
    
    # Verify child belongs to current user
    child_parent_id = extract_id_from_link(child.parent)  # type: ignore
    current_user_id = str(current_user.id)
    if not child_parent_id or child_parent_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this child"
        )
    
    # Verify reward belongs to current user (or allow if created_by is None for backward compatibility)
    if reward.created_by is not None:
        reward_owner_id = extract_id_from_link(reward.created_by)
        if not reward_owner_id or reward_owner_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not own this reward"
            )
    
    # Check if child has enough coins
    if child.current_coins < redemption.cost_coins:  # type: ignore
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Child has insufficient coins"
        )
    
    # Deduct coins from child
    child.current_coins -= redemption.cost_coins  # type: ignore
    await child.save()  # type: ignore
    
    # Decrement stock if tracking stock
    if reward.stock_quantity > 0:  # type: ignore
        reward.stock_quantity -= 1  # type: ignore
        await reward.save()  # type: ignore
    
    # Create child reward record
    child_reward = ChildReward(
        child=child,  # type: ignore
        reward=reward,  # type: ignore
    )
    await child_reward.insert()
    
    # Use set() to update only specific fields without serializing Links
    # This avoids the "Can not create dbref without id" error
    await redemption.set({
        "status": "approved",
        "processed_at": utc_now(),
        "processed_by": str(current_user.id)
    })
    
    return {
        "message": "Redemption approved successfully",
        "child_coins_remaining": child.current_coins,  # type: ignore
    }

async def reject_redemption(
    request_id: str,
    current_user: User = None
):
    """Reject redemption request (parent only) - verify child ownership"""
    redemption = await RedemptionRequest.get(request_id)
    if not redemption:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Redemption request not found"
        )
    
    if redemption.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request already {redemption.status}"
        )
    
    # Verify child belongs to current user
    child = await fetch_link_or_get_object(redemption.child, Child)
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )
    
    child_parent_id = extract_id_from_link(child.parent)  # type: ignore
    current_user_id = str(current_user.id)
    if not child_parent_id or child_parent_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this child"
        )
    
    # Fetch reward if needed
    reward = await fetch_link_or_get_object(redemption.reward, Reward)
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found"
        )
    
    # Use set() to update only specific fields without serializing Links
    # This avoids the "Can not create dbref without id" error
    await redemption.set({
        "status": "rejected",
        "processed_at": utc_now(),
        "processed_by": str(current_user.id)
    })
    
    return {"message": "Redemption rejected"}

async def get_inventory(
    child_id: str,
    child: Child = None
):
    """Get child's reward inventory"""
    child_rewards = [
        cr
        for cr in await ChildReward.find_all().to_list()
        if extract_id_from_link(cr.child) == str(child.id)
    ]
    results: list[dict] = []
    for cr in child_rewards:
        reward = await fetch_link_or_get_object(cr.reward, Reward)
        if not reward:
            continue
        results.append({
            "id": str(cr.id),
            "earned_at": cr.earned_at.isoformat(),
            "is_equipped": cr.is_equipped,
            "reward": {
                "id": str(reward.id),
                "name": reward.name,
                "description": reward.description,
                "type": reward.type,
                "image_url": reward.image_url,
            }
        })
    return results

async def equip_avatar_skin(
    child_id: str,
    reward_id: str = None,
    child: Child = None
):
    """Equip a skin/avatar reward"""
    reward_obj = await Reward.get(reward_id)
    if not reward_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found."
        )

    child_rewards = [
        cr
        for cr in await ChildReward.find_all().to_list()
        if extract_id_from_link(cr.child) == str(child.id)
    ]
    child_reward = None
    for candidate in child_rewards:
        if extract_id_from_link(candidate.reward) == str(reward_obj.id):
            child_reward = candidate
            break
    if not child_reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found in child's inventory."
        )

    if reward_obj.type != RewardType.SKIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reward type for equipping. Only skins can be equipped."
        )
    
    
    all_equipped = await ChildReward.find(
        ChildReward.child.id == child.id,  # type: ignore
        ChildReward.is_equipped == True
    ).to_list()
    
    for equipped in all_equipped:
        if str(equipped.id) != str(child_reward.id):
            equipped.is_equipped = False
            await equipped.save()
    
    
    child_reward.is_equipped = True
    await child_reward.save()
    
    return {
        "message": "Skin equipped successfully.",
        "reward_id": reward_id
    }
