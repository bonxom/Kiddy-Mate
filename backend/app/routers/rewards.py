from fastapi import APIRouter, HTTPException, status, Depends
from app.models.reward_models import Reward, RewardType, ChildReward
from app.models.child_models import Child

from app.dependencies import verify_child_ownership
from typing import List

router = APIRouter()

@router.get("/children/{child_id}/inventory", response_model=List[dict])
async def get_inventory(
    child_id: str,
    child: Child = Depends(verify_child_ownership)
):
    child_rewards = await ChildReward.find(ChildReward.child.id == child.id).to_list()
    results: list[dict] = []
    for cr in child_rewards:
        reward_link = cr.reward
        reward_id_or_ref = getattr(reward_link, "id", None) or getattr(reward_link, "ref", None)
        reward_id_str = str(getattr(reward_id_or_ref, "id", reward_id_or_ref)) if reward_id_or_ref is not None else None
        reward_obj = await Reward.get(reward_id_str) if reward_id_str else None
        results.append({
            "id": str(cr.id),
            "earned_at": cr.earned_at,
            "reward": {
                "id": str(reward_obj.id) if reward_obj else None,
                "name": reward_obj.name if reward_obj else None,
                "description": reward_obj.description if reward_obj else None,
                "type": reward_obj.type if reward_obj else None,
                "image_url": reward_obj.image_url if reward_obj else None,
            }
        })
    return results

@router.post("/children/{child_id}/avatar/equip", response_model=dict)
async def equip_avatar_skin(
    child_id: str,
    reward_id: str,
    child: Child = Depends(verify_child_ownership)
):
    reward_obj = await Reward.get(reward_id)
    if not reward_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found."
        )

    child_reward = await ChildReward.find_one(
        ChildReward.child.id == child.id,
        ChildReward.reward.id == reward_obj.id
    )
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
    
    return {"message": "Trang bị skin thành công.", "reward_id": reward_id}