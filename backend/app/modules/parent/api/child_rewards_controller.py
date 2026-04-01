from typing import List

from fastapi import APIRouter, Depends, Query

from app.core.security.dependencies import resolve_child_for_current_actor
from app.modules.children.domain.models import Child
from app.modules.rewards.application import reward_service as service

router = APIRouter()


@router.post("/{child_id}/redeem", response_model=dict)
async def request_redemption(
    child_id: str,
    request_data: service.RedemptionRequestCreate,
    child: Child = Depends(resolve_child_for_current_actor),
) -> dict:
    return await service.request_redemption(
        child_id=child_id,
        request_data=request_data,
        child=child,
    )


@router.get("/{child_id}/inventory", response_model=List[dict])
async def get_inventory(
    child_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
) -> List[dict]:
    return await service.get_inventory(child_id=child_id, child=child)


@router.post("/{child_id}/avatar/equip", response_model=dict)
async def equip_avatar_skin(
    child_id: str,
    reward_id: str = Query(..., description="Reward ID to equip"),
    child: Child = Depends(resolve_child_for_current_actor),
) -> dict:
    return await service.equip_avatar_skin(
        child_id=child_id,
        reward_id=reward_id,
        child=child,
    )
