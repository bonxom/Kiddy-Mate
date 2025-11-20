from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Optional
from app.models.user_models import User
from app.models.child_models import Child, ChildDevelopmentAssessment
from app.services.auth import get_current_user

router = APIRouter()

class ChildOnboardingData(BaseModel):
    full_name: str
    nickname: str
    date_of_birth: str  # ISO format string
    gender: str
    favorite_topics: List[str]
    personality: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    strengths: Optional[List[str]] = None
    challenges: Optional[List[str]] = None
    discipline_autonomy: Dict[str, Optional[str]]
    emotional_intelligence: Dict[str, Optional[str]]
    social_interaction: Dict[str, Optional[str]]

class OnboardingRequest(BaseModel):
    parent_display_name: str
    phone_number: Optional[str] = None
    children: List[ChildOnboardingData]

@router.post("/onboarding/complete")
async def complete_onboarding(
    request: OnboardingRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Complete onboarding process:
    1. Update user info
    2. Create children
    3. Create assessments for each child
    4. Mark onboarding as complete
    """
    # Update user info
    current_user.full_name = request.parent_display_name
    if request.phone_number:
        current_user.phone_number = request.phone_number
    current_user.onboarding_completed = True
    await current_user.save()
    
    created_children = []
    
    for child_data in request.children:
        # Parse date of birth
        try:
            birth_date = datetime.fromisoformat(child_data.date_of_birth.replace('Z', '+00:00'))
        except:
            # Fallback: try parsing as simple date string
            birth_date = datetime.strptime(child_data.date_of_birth, '%Y-%m-%d')
        
        # Create child (Beanie automatically handles Link type)
        new_child = Child(
            parent=current_user,  # type: ignore
            name=child_data.full_name,
            birth_date=birth_date,
            nickname=child_data.nickname,
            gender=child_data.gender,
            personality=child_data.personality,
            interests=child_data.interests,
            strengths=child_data.strengths,
            challenges=child_data.challenges,
            initial_traits={"favorite_topics": child_data.favorite_topics}
        )
        await new_child.insert()
        
        # Create assessment (Beanie automatically handles Link type)
        assessment = ChildDevelopmentAssessment(
            child=new_child,  # type: ignore
            parent=current_user,  # type: ignore
            discipline_autonomy=child_data.discipline_autonomy,
            emotional_intelligence=child_data.emotional_intelligence,
            social_interaction=child_data.social_interaction
        )
        await assessment.insert()
        
        created_children.append({
            "id": str(new_child.id),
            "name": new_child.name,
            "nickname": child_data.nickname
        })
    
    return {
        "message": "Onboarding completed successfully",
        "children": created_children
    }
