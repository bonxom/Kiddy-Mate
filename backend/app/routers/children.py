from fastapi import APIRouter, HTTPException, status, Depends
from app.models.child_models import Child
from app.models.user_models import User
from app.schemas.schemas import ChildCreate, ChildPublic, ChildUpdate
from app.services.auth import get_current_user
from app.dependencies import verify_child_ownership, get_user_children
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
        nickname=child.nickname,
        gender=child.gender,
        avatar_url=child.avatar_url,
        personality=child.personality,
        interests=child.interests,
        strengths=child.strengths,
        challenges=child.challenges,
    )


@router.post("/", response_model=ChildPublic)
async def create_child(
    child: ChildCreate,
    current_user: User = Depends(get_current_user)
):
    new_child = Child(
        parent=current_user,  
        name=child.name,
        birth_date=child.birth_date,
        initial_traits=child.initial_traits,
        nickname=child.nickname,
        gender=child.gender,
        avatar_url=child.avatar_url,
        personality=child.personality,
        interests=child.interests,
        strengths=child.strengths,
        challenges=child.challenges,
    )
    await new_child.insert()
    return _to_child_public(new_child)

@router.get("/", response_model=List[ChildPublic])
async def get_children(current_user: User = Depends(get_current_user)):
    """
    Get all children belonging to the current user.
    Uses helper function to handle Link references correctly.
    """
    children = await get_user_children(current_user)
    return [_to_child_public(c) for c in children]

@router.get("/{child_id}", response_model=ChildPublic)
async def get_child(
    child_id: str,
    child: Child = Depends(verify_child_ownership)
):
    return _to_child_public(child)

@router.put("/{child_id}", response_model=ChildPublic)
async def update_child(
    child_id: str,
    updated_child: ChildUpdate,
    child: Child = Depends(verify_child_ownership)
):
    """Update child profile - only update fields that are provided"""
    if updated_child.name is not None:
        child.name = updated_child.name
    if updated_child.birth_date is not None:
        child.birth_date = updated_child.birth_date
    if updated_child.initial_traits is not None:
        child.initial_traits = updated_child.initial_traits
    if updated_child.nickname is not None:
        child.nickname = updated_child.nickname
    if updated_child.gender is not None:
        child.gender = updated_child.gender
    if updated_child.avatar_url is not None:
        child.avatar_url = updated_child.avatar_url
    if updated_child.personality is not None:
        child.personality = updated_child.personality
    if updated_child.interests is not None:
        child.interests = updated_child.interests
    if updated_child.strengths is not None:
        child.strengths = updated_child.strengths
    if updated_child.challenges is not None:
        child.challenges = updated_child.challenges
    
    await child.save()
    return _to_child_public(child)

@router.post("/{child_id}/select", response_model=dict)
async def select_child(
    child_id: str,
    child: Child = Depends(verify_child_ownership)
):
    return {"message": f"Child {child_id} selected successfully."}

@router.delete("/{child_id}", response_model=dict)
async def delete_child(
    child_id: str,
    child: Child = Depends(verify_child_ownership)
):
    """Delete a child and all associated data (tasks, rewards, assessments)."""
    from app.models.childtask_models import ChildTask
    from app.models.reward_models import ChildReward
    from app.models.child_models import ChildDevelopmentAssessment
    from app.models.gamesession_models import GameSession
    from app.models.interactionlog_models import InteractionLog
    
    
    await ChildTask.find(ChildTask.child.id == child.id).delete()  
    await ChildReward.find(ChildReward.child.id == child.id).delete()  
    await ChildDevelopmentAssessment.find(ChildDevelopmentAssessment.child.id == child.id).delete()  
    await GameSession.find(GameSession.child.id == child.id).delete()  
    await InteractionLog.find(InteractionLog.child.id == child.id).delete()  
    
    
    await child.delete()
    
    return {"message": f"Child {child_id} and all associated data deleted successfully."}