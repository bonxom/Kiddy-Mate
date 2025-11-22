from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Optional
import logging
from app.models.user_models import User
from app.models.child_models import Child, ChildDevelopmentAssessment
from app.services.auth import get_current_user
from app.services.llm import analyze_assessment_with_chatgpt
from app.data.assessment_questions import ASSESSMENT_QUESTIONS


def _calculate_fallback_traits(assessment_answers: Dict[str, Dict[str, Optional[str]]]) -> Dict:
    """
    Calculate trait scores from assessment answers when Gemini API is unavailable.
    Converts 1-5 scale to 0-100 scale.
    """
    def calculate_average_score(answers: Dict[str, Optional[str]]) -> int:
        """Calculate average score from answers (1-5 scale to 0-100 scale)"""
        valid_scores = []
        for rating in answers.values():
            if rating:
                try:
                    score = int(rating)
                    if 1 <= score <= 5:
                        # Convert 1-5 to 0-100: 1=0, 2=25, 3=50, 4=75, 5=100
                        valid_scores.append((score - 1) * 25)
                except (ValueError, TypeError):
                    continue
        
        if not valid_scores:
            return 50  # Default neutral score
        
        return int(sum(valid_scores) / len(valid_scores))
    
    # Calculate scores for each category
    discipline_score = calculate_average_score(assessment_answers.get("discipline_autonomy", {}))
    emotional_score = calculate_average_score(assessment_answers.get("emotional_intelligence", {}))
    social_score = calculate_average_score(assessment_answers.get("social_interaction", {}))
    
    # Map to traits
    # Independence and Discipline both use discipline_autonomy
    # Logic is estimated based on average of all scores
    logic_score = int((discipline_score + emotional_score + social_score) / 3)
    
    return {
        "overall_traits": {
            "independence": discipline_score,
            "emotional": emotional_score,
            "discipline": discipline_score,
            "social": social_score,
            "logic": logic_score
        },
        "explanations": {
            "independence": "Calculated from discipline and autonomy assessment answers.",
            "emotional": "Calculated from emotional intelligence assessment answers.",
            "discipline": "Calculated from discipline and autonomy assessment answers.",
            "social": "Calculated from social interaction assessment answers.",
            "logic": "Estimated from overall assessment performance."
        },
        "recommended_focus": _get_recommended_focus({
            "independence": discipline_score,
            "emotional": emotional_score,
            "discipline": discipline_score,
            "social": social_score,
            "logic": logic_score
        })
    }


def _get_recommended_focus(traits: Dict[str, int]) -> List[str]:
    """Get 2-4 skills with lowest scores for recommended focus"""
    # Sort traits by score (lowest first)
    sorted_traits = sorted(traits.items(), key=lambda x: x[1])
    
    # Get 2-4 lowest scores
    focus_count = min(3, len(sorted_traits))
    recommended = [trait[0].capitalize() for trait in sorted_traits[:focus_count]]
    
    return recommended

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
        
        # Calculate age for Gemini analysis
        age = (datetime.now() - birth_date).days // 365
        
        # Prepare child info for Gemini
        child_info = {
            "name": child_data.full_name,
            "nickname": child_data.nickname,
            "age": age,
            "gender": child_data.gender,
            "favorite_topics": child_data.favorite_topics,
            "personality": child_data.personality or [],
            "interests": child_data.interests or [],
            "strengths": child_data.strengths or [],
            "challenges": child_data.challenges or []
        }
        
        # Prepare assessment answers for Gemini
        assessment_answers = {
            "discipline_autonomy": child_data.discipline_autonomy,
            "emotional_intelligence": child_data.emotional_intelligence,
            "social_interaction": child_data.social_interaction
        }
        
        # Call ChatGPT API to analyze assessment and get initial traits
        initial_traits = {"favorite_topics": child_data.favorite_topics}
        
        # Check if OpenAI API key is configured
        from app.config import settings
        if not settings.OPENAI_API_KEY:
            logging.warning(f"⚠️ OPENAI_API_KEY not configured. Using fallback calculation for {child_data.full_name}")
            logging.warning("   Please set OPENAI_API_KEY in .env file to enable ChatGPT analysis")
            initial_traits.update(_calculate_fallback_traits(assessment_answers))
        else:
            try:
                logging.info(f"🔍 Calling ChatGPT API to analyze assessment for {child_data.full_name}...")
                chatgpt_result = analyze_assessment_with_chatgpt(
                    child_info=child_info,
                    assessment_answers=assessment_answers,
                    questions_data=ASSESSMENT_QUESTIONS
                )
                
                # Store the ChatGPT analysis results in initial_traits
                initial_traits.update({
                    "overall_traits": chatgpt_result["overall_traits"],
                    "explanations": chatgpt_result["explanations"],
                    "recommended_focus": chatgpt_result["recommended_focus"],
                    "favorite_topics": child_data.favorite_topics
                })
                
                logging.info(f"✅ Successfully analyzed assessment for {child_data.full_name} using ChatGPT")
                logging.info(f"   Traits: {chatgpt_result['overall_traits']}")
            except RuntimeError as e:
                error_msg = str(e)
                if "not configured" in error_msg.lower():
                    logging.error(f"❌ {error_msg}")
                    logging.warning(f"   Using fallback calculation for {child_data.full_name}")
                    initial_traits.update(_calculate_fallback_traits(assessment_answers))
                elif "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
                    logging.warning(f"⚠️ ChatGPT quota/rate limit exceeded for {child_data.full_name}")
                    logging.warning(f"   Error: {error_msg}")
                    logging.warning(f"   Using fallback calculation")
                    initial_traits.update(_calculate_fallback_traits(assessment_answers))
                elif "Invalid API key" in error_msg or "401" in error_msg:
                    logging.error(f"❌ Invalid OpenAI API key for {child_data.full_name}")
                    logging.error(f"   Error: {error_msg}")
                    logging.warning(f"   Using fallback calculation")
                    initial_traits.update(_calculate_fallback_traits(assessment_answers))
                else:
                    logging.error(f"❌ Failed to analyze assessment with ChatGPT for {child_data.full_name}: {error_msg}")
                    logging.warning(f"   Using fallback calculation")
                    initial_traits.update(_calculate_fallback_traits(assessment_answers))
            except Exception as e:
                logging.error(f"❌ Unexpected error analyzing assessment with ChatGPT for {child_data.full_name}: {type(e).__name__}: {e}")
                logging.warning(f"   Using fallback calculation")
                import traceback
                logging.debug(traceback.format_exc())
                initial_traits.update(_calculate_fallback_traits(assessment_answers))
        
        # Create child with initial_traits from ChatGPT
        logging.info(f"📝 Saving child {child_data.full_name} with initial_traits: {list(initial_traits.get('overall_traits', {}).keys())}")
        from beanie import Link
        new_child = Child(
            parent=Link(current_user, User),  
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
            initial_traits=initial_traits
        )
        await new_child.insert()
        logging.info(f"💾 Child {child_data.full_name} saved with parent ID: {str(current_user.id)}")
        logging.info(f"💾 Child {child_data.full_name} saved to database with ID: {new_child.id}")
        
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
