from typing import List

from fastapi import APIRouter, Depends

from app.core.security.dependencies import resolve_child_for_current_actor
from app.modules.children.application import children_service as service
from app.modules.children.domain.models import Child
from app.models.user_models import User
from app.schemas.schemas import ChildPublic
from app.services.auth import get_current_user

router = APIRouter()


@router.post("", response_model=ChildPublic)
async def create_child(
    child: service.ChildCreate,
    current_user: User = Depends(get_current_user),
) -> ChildPublic:
    return await service.create_child(child=child, current_user=current_user)


@router.get("", response_model=List[ChildPublic])
async def get_children(current_user: User = Depends(get_current_user)) -> List[ChildPublic]:
    return await service.get_children(current_user=current_user)


@router.get("/{child_id}", response_model=ChildPublic)
async def get_child(
    child_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
) -> ChildPublic:
    return await service.get_child(child_id=child_id, child=child)


@router.put("/{child_id}", response_model=ChildPublic)
async def update_child(
    child_id: str,
    updated_child: service.ChildUpdate,
    child: Child = Depends(resolve_child_for_current_actor),
) -> ChildPublic:
    return await service.update_child(child_id=child_id, updated_child=updated_child, child=child)


@router.post("/{child_id}/select", response_model=dict)
async def select_child(
    child_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
) -> dict:
    return await service.select_child(child_id=child_id, child=child)


@router.delete("/{child_id}", response_model=dict)
async def delete_child(
    child_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
) -> dict:
    return await service.delete_child(child_id=child_id, child=child)
