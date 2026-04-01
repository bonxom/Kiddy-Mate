from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status

from app.core.security.dependencies import require_parent_principal
from app.modules.identity.domain.models import User
from app.modules.rewards.application import reward_service as service

router = APIRouter()


@router.get("/rewards", response_model=List[dict])
async def get_all_rewards(
    is_active: Optional[bool] = Query(None),
    type: Optional[service.RewardType] = Query(None),
    current_user: User = Depends(require_parent_principal),
) -> List[dict]:
    return await service.get_all_rewards(
        is_active=is_active,
        type=type,
        current_user=current_user,
    )


@router.post("/rewards", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_reward(
    reward_data: service.RewardCreate,
    current_user: User = Depends(require_parent_principal),
) -> dict:
    return await service.create_reward(reward_data=reward_data, current_user=current_user)


@router.put("/rewards/{reward_id}", response_model=dict)
async def update_reward(
    reward_id: str,
    reward_update: service.RewardUpdate,
    current_user: User = Depends(require_parent_principal),
) -> dict:
    return await service.update_reward(
        reward_id=reward_id,
        reward_update=reward_update,
        current_user=current_user,
    )


@router.delete("/rewards/{reward_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reward(
    reward_id: str,
    current_user: User = Depends(require_parent_principal),
):
    return await service.delete_reward(reward_id=reward_id, current_user=current_user)


@router.patch("/rewards/{reward_id}/quantity", response_model=dict)
async def update_reward_quantity(
    reward_id: str,
    delta: int = Query(..., description="Change in quantity (+/- number)"),
    current_user: User = Depends(require_parent_principal),
) -> dict:
    return await service.update_reward_quantity(
        reward_id=reward_id,
        delta=delta,
        current_user=current_user,
    )


@router.get("/redemption-requests", response_model=List[dict])
async def get_redemption_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(require_parent_principal),
) -> List[dict]:
    return await service.get_redemption_requests(
        status_filter=status_filter,
        current_user=current_user,
    )


@router.post("/redemption-requests/{request_id}/approve", response_model=dict)
async def approve_redemption(
    request_id: str,
    current_user: User = Depends(require_parent_principal),
) -> dict:
    return await service.approve_redemption(request_id=request_id, current_user=current_user)


@router.post("/redemption-requests/{request_id}/reject", response_model=dict)
async def reject_redemption(
    request_id: str,
    current_user: User = Depends(require_parent_principal),
) -> dict:
    return await service.reject_redemption(request_id=request_id, current_user=current_user)
