from fastapi import APIRouter, HTTPException, status, Depends
from beanie import Link
from app.models.child_models import Child, ChildDevelopmentAssessment
from app.models.user_models import User
from app.schemas.schemas import ChildCreate, ChildPublic, ChildUpdate
from app.services.auth import get_current_user, hash_password
from app.services.llm import analyze_assessment_with_chatgpt
from app.data.assessment_questions import ASSESSMENT_QUESTIONS
from app.dependencies import verify_child_ownership, get_user_children, extract_id_from_link
from app.routers.onboarding import _calculate_fallback_traits
from typing import List, Dict, Optional
from datetime import datetime
import logging
import asyncio

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
    """
    Create a new child profile.
    If assessment data is provided, calls LLM to analyze and generate initial_traits.
    Similar to onboarding flow.
    """
    # Validate username if provided
    if child.username:
        username = child.username.strip()
        if not username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username cannot be empty."
            )
        
        # Check if username already exists
        existing_child = await Child.find_one(Child.username == username)
        if existing_child:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '{username}' is already taken. Please choose another username."
            )
    else:
        username = None
    
    # Calculate age for LLM analysis
    age = (datetime.now() - child.birth_date).days // 365
    
    # Prepare initial_traits
    initial_traits = child.initial_traits or {}
    
    # If assessment data is provided, call LLM to analyze (same as onboarding)
    if child.assessment:
        # Prepare child info for OpenAI
        child_info = {
            "name": child.name,
            "nickname": child.nickname or child.name,
            "age": age,
            "gender": child.gender or "unknown",
            "favorite_topics": child.interests or [],
            "personality": child.personality or [],
            "interests": child.interests or [],
            "strengths": child.strengths or [],
            "challenges": child.challenges or []
        }
        
        # Prepare assessment answers for OpenAI
        assessment_answers = {
            "discipline_autonomy": child.assessment.get("discipline_autonomy", {}),
            "emotional_intelligence": child.assessment.get("emotional_intelligence", {}),
            "social_interaction": child.assessment.get("social_interaction", {})
        }
        
        # Call OpenAI API to analyze assessment and get initial traits
        initial_traits = {"favorite_topics": child.interests or []}
        
        # Check if OpenAI API key is configured
        from app.config import settings
        if not settings.NAVER_API_KEY:
            logging.warning(f"⚠️ NAVER_API_KEY not configured. Using fallback calculation for {child.name}")
            initial_traits.update(_calculate_fallback_traits(assessment_answers))
        else:
            try:
                logging.info(f"🔍 Calling OpenAI API to analyze assessment for {child.name}...")
                openai_result = analyze_assessment_with_chatgpt(
                    child_info=child_info,
                    assessment_answers=assessment_answers,
                    questions_data=ASSESSMENT_QUESTIONS
                )
                
                # Store the OpenAI analysis results in initial_traits
                initial_traits.update({
                    "overall_traits": openai_result["overall_traits"],
                    "explanations": openai_result["explanations"],
                    "recommended_focus": openai_result["recommended_focus"],
                    "favorite_topics": child.interests or []
                })
                
                logging.info(f"✅ Successfully analyzed assessment for {child.name} using OpenAI")
            except Exception as e:
                error_msg = str(e)
                logging.error(f"❌ Failed to analyze assessment with OpenAI for {child.name}: {error_msg}")
                logging.warning(f"   Using fallback calculation")
                initial_traits.update(_calculate_fallback_traits(assessment_answers))
    
    # Create child
    new_child = Child(
        parent=Link(current_user, User),  # type: ignore
        name=child.name,
        birth_date=child.birth_date,
        initial_traits=initial_traits,
        nickname=child.nickname,
        gender=child.gender,
        avatar_url=child.avatar_url,
        personality=child.personality,
        interests=child.interests,
        strengths=child.strengths,
        challenges=child.challenges,
        username=username,
        password_hash=hash_password(child.password) if child.password else None,
    )
    await new_child.insert()
    logging.info(f"💾 Child {child.name} saved with parent ID: {str(current_user.id)}")
    
    # Create assessment record if assessment data was provided
    if child.assessment:
        assessment = ChildDevelopmentAssessment(
            child=new_child,  # type: ignore
            parent=Link(current_user, User),  # type: ignore
            discipline_autonomy=child.assessment.get("discipline_autonomy", {}),
            emotional_intelligence=child.assessment.get("emotional_intelligence", {}),
            social_interaction=child.assessment.get("social_interaction", {})
        )
        await assessment.insert()
        logging.info(f"📊 Created assessment record for {child.name}")
    
    # Trigger initial task generation in background (non-blocking)
    from app.routers.generate import generate_initial_tasks_for_child
    asyncio.create_task(generate_initial_tasks_for_child(str(new_child.id)))
    logging.info(f"🚀 Triggered background task generation for new child: {child.name}")
    
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
    
    # Handle username update
    if updated_child.username is not None:
        username = updated_child.username.strip()
        if username:
            # Check if username is already taken by another child
            existing_child = await Child.find_one(Child.username == username)
            if existing_child and str(existing_child.id) != child_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Username '{username}' is already taken. Please choose another username."
                )
            child.username = username
        else:
            # Empty username means remove it
            child.username = None
    
    # Handle password update
    if updated_child.password is not None:
        password = updated_child.password.strip()
        if password:
            child.password_hash = hash_password(password)
            logging.info(f"🔐 Password updated for child: {child.name}")
        else:
            # Empty password means remove it
            child.password_hash = None
    
    await child.save()
    logging.info(f"✅ Child profile updated: {child.name} (ID: {child_id})")
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
    
    # Delete all related data using child.id directly
    child_id_str = str(child.id)
    
    # Get all records and filter by child_id
    all_tasks = await ChildTask.find_all().to_list()
    for task in all_tasks:
        if extract_id_from_link(task.child) == child_id_str:
            await task.delete()
    
    all_rewards = await ChildReward.find_all().to_list()
    for reward in all_rewards:
        if extract_id_from_link(reward.child) == child_id_str:
            await reward.delete()
    
    all_assessments = await ChildDevelopmentAssessment.find_all().to_list()
    for assessment in all_assessments:
        if extract_id_from_link(assessment.child) == child_id_str:
            await assessment.delete()
    
    all_sessions = await GameSession.find_all().to_list()
    for session in all_sessions:
        if extract_id_from_link(session.child) == child_id_str:
            await session.delete()
    
    all_logs = await InteractionLog.find_all().to_list()
    for log in all_logs:
        if extract_id_from_link(log.child) == child_id_str:
            await log.delete()
    
    # Delete the child
    await child.delete()
    
    return {"message": f"Child {child_id} and all associated data deleted successfully."}