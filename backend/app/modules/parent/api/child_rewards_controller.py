from typing import List

from fastapi import APIRouter, Depends

from app.core.security.dependencies import require_parent_principal, resolve_parent_owned_child
from app.modules.children.domain.models import Child
from app.modules.identity.domain.models import User
from app.modules.rewards.application import reward_service as service

router = APIRouter()


@router.get("/{child_id}/inventory", response_model=List[dict])
async def get_inventory(
    child_id: str,
    child: Child = Depends(resolve_parent_owned_child),
    _: User = Depends(require_parent_principal),
) -> List[dict]:
    return await service.get_inventory(child_id=child_id, child=child)
