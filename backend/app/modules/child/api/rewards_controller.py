from fastapi import APIRouter, Depends, Query

from app.core.security.dependencies import get_authenticated_child
from app.modules.children.domain.models import Child
from app.modules.rewards.application import reward_service as service

router = APIRouter()


@router.post("/me/rewards/redeem", response_model=dict)
async def redeem_my_reward(
    request_data: service.RedemptionRequestCreate,
    child: Child = Depends(get_authenticated_child),
) -> dict:
    return await service.request_redemption(
        child_id=str(child.id),
        request_data=request_data,
        child=child,
    )


@router.get("/me/rewards/inventory", response_model=list[dict])
async def get_my_inventory(child: Child = Depends(get_authenticated_child)) -> list[dict]:
    return await service.get_inventory(child_id=str(child.id), child=child)


@router.post("/me/rewards/avatar/equip", response_model=dict)
async def equip_my_avatar_skin(
    reward_id: str = Query(..., description="Reward ID to equip"),
    child: Child = Depends(get_authenticated_child),
) -> dict:
    return await service.equip_avatar_skin(
        child_id=str(child.id),
        reward_id=reward_id,
        child=child,
    )
