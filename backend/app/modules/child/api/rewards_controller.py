from fastapi import APIRouter, Depends, Query

from app.core.security.child_context import ChildAuthContext
from app.core.security.dependencies import get_authenticated_child, require_child_auth_context
from app.modules.child.application import reward_service as service
from app.modules.children.domain.models import Child

router = APIRouter()


@router.post("/me/rewards/redeem", response_model=dict)
async def redeem_my_reward(
    request_data: service.RedeemRewardRequest,
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> dict:
    return await service.redeem_reward(
        request=request_data,
        child=child,
        context=context,
    )


@router.get("/me/rewards/inventory", response_model=list[dict])
async def get_my_inventory(
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> list[dict]:
    return await service.get_inventory(child=child, context=context)


@router.post("/me/rewards/avatar/equip", response_model=dict)
async def equip_my_avatar_skin(
    reward_id: str = Query(..., description="Reward ID to equip"),
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> dict:
    return await service.equip_avatar_skin(
        reward_id=reward_id,
        child=child,
        context=context,
    )
