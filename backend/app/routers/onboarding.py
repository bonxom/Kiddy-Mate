from fastapi import APIRouter, Depends, HTTPException, status
from beanie import Link
from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Optional
from app.models.user_models import User
from app.models.child_models import Child, ChildDevelopmentAssessment
from app.services.auth import get_current_user, hash_password

router = APIRouter()

class ChildOnboardingData(BaseModel):
    full_name: str
    nickname: str
    date_of_birth: str  
    gender: str
    username: str  # For child login
    password: str  # Plain password, will be hashed
    favorite_topics: List[str]
    personality: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    strengths: Optional[List[str]] = None
    challenges: Optional[List[str]] = None
    discipline_autonomy: Dict[str, Optional[str]]
    emotional_intelligence: Dict[str, Optional[str]]
    social_interaction: Dict[str, Optional[str]]

class OnboardingRequest(BaseModel):
    parent_email: str  # Email to identify the parent
    parent_display_name: str
    phone_number: Optional[str] = None
    children: List[ChildOnboardingData]

@router.post("/onboarding/complete")
async def complete_onboarding(
    request: OnboardingRequest
):
    """
    Complete onboarding process (PUBLIC endpoint):
    1. Find user by email
    2. Update user info
    3. Create children
    4. Create assessments for each child
    5. Mark onboarding as complete
    """
    # Find user by email
    current_user = await User.find_one(User.email == request.parent_email)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register first."
        )
    
    current_user.full_name = request.parent_display_name
    if request.phone_number:
        current_user.phone_number = request.phone_number
    current_user.onboarding_completed = True
    await current_user.save()
    
    created_children = []
    
    for child_data in request.children:
        # Check if username already exists
        existing_child = await Child.find_one(Child.username == child_data.username)
        if existing_child:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '{child_data.username}' is already taken. Please choose another username."
            )

        try:
            birth_date = datetime.fromisoformat(child_data.date_of_birth.replace('Z', '+00:00'))
        except:
            
            birth_date = datetime.strptime(child_data.date_of_birth, '%Y-%m-%d')
        
        # Hash password
        hashed_password = hash_password(child_data.password)

        new_child = Child(
            parent=current_user,  # type: ignore
            name=child_data.full_name,
            birth_date=birth_date,
            username=child_data.username,
            password_hash=hashed_password,
            nickname=child_data.nickname,
            gender=child_data.gender,
            personality=child_data.personality,
            interests=child_data.interests,
            strengths=child_data.strengths,
            challenges=child_data.challenges,
            initial_traits={"favorite_topics": child_data.favorite_topics}
        )
        await new_child.insert()
        
        # Create assessment
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
