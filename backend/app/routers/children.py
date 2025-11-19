from fastapi import APIRouter, HTTPException, status, Depends
from app.models.child_models import Child
from app.models.user_models import User
from app.schemas.schemas import ChildCreate, ChildPublic
from app.services.auth import get_current_user
from app.dependencies import verify_child_ownership
from typing import List

router = APIRouter()


def _to_child_public(child: Child) -> ChildPublic:
    """Convert Beanie Child document to ChildPublic schema."""
    return ChildPublic(
        id=str(child.id),
        name=child.name,
        birth_date=child.birth_date,
        initial_traits=child.initial_traits,
        current_coins=child.current_coins,
        level=child.level,
    )


@router.post("/children", response_model=ChildPublic)
async def create_child(
    child: ChildCreate,
    current_user: User = Depends(get_current_user)
):
    new_child = Child(
        parent=current_user,
        name=child.name,
        birth_date=child.birth_date,
        initial_traits=child.initial_traits
    )
    await new_child.insert()
    return _to_child_public(new_child)

@router.get("/children", response_model=List[ChildPublic])
async def get_children(current_user: User = Depends(get_current_user)):
    children = await Child.find(Child.parent.id == current_user.id).to_list()
    return [_to_child_public(c) for c in children]

@router.get("/children/{child_id}", response_model=ChildPublic)
async def get_child(
    child_id: str,
    child: Child = Depends(verify_child_ownership)
):
    return _to_child_public(child)

@router.put("/children/{child_id}", response_model=ChildPublic)
async def update_child(
    child_id: str,
    updated_child: ChildCreate,
    child: Child = Depends(verify_child_ownership)
):
    child.name = updated_child.name
    child.birth_date = updated_child.birth_date
    child.initial_traits = updated_child.initial_traits
    await child.save()
    return _to_child_public(child)

@router.post("/children/{child_id}/select", response_model=dict)
async def select_child(
    child_id: str,
    child: Child = Depends(verify_child_ownership)
):
    return {"message": f"Child {child_id} selected successfully."}