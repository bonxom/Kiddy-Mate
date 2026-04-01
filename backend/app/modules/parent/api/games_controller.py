from typing import Dict, List

from fastapi import APIRouter, Depends

from app.core.security.dependencies import require_parent_principal, resolve_parent_owned_child
from app.modules.children.domain.models import Child
from app.modules.games.application import game_service as service
from app.modules.identity.domain.models import User
from app.schemas.schemas import MiniGamePublic

router = APIRouter()


@router.get("/{child_id}/games", response_model=List[MiniGamePublic])
async def get_games(
    child_id: str,
    child: Child = Depends(resolve_parent_owned_child),
    _: User = Depends(require_parent_principal),
) -> List[MiniGamePublic]:
    return await service.get_games(child_id=child_id, child=child)
