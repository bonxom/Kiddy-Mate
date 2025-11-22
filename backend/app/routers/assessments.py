from datetime import datetime
from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from beanie import Link
from app.dependencies import verify_child_ownership
from app.models.child_models import Child, ChildDevelopmentAssessment
from app.models.user_models import User
from app.schemas.schemas import (
    ChildAssessmentCreate,
    ChildAssessmentPublic,
    ChildAssessmentUpdate,
    DisciplineAutonomyAnswers,
    EmotionalIntelligenceAnswers,
    SocialInteractionAnswers,
    SimpleAssessmentCreate,
    SimpleAssessmentUpdate,
)

router = APIRouter()

def _extract_link_id(link: Optional[object]) -> Optional[str]:
    """Return the id string from a Beanie Link field."""
    if link is None:
        return None
    link_id = getattr(link, "id", None)
    if link_id is not None:
        return str(link_id)
    ref_obj = getattr(link, "ref", None)
    if ref_obj is None:
        return None
    return str(getattr(ref_obj, "id", ref_obj))

def _serialize_assessment(doc: ChildDevelopmentAssessment) -> ChildAssessmentPublic:
    child_id = _extract_link_id(doc.child)
    parent_id = _extract_link_id(doc.parent)
    return ChildAssessmentPublic(
        id=str(doc.id),
        child_id=child_id if child_id else "",
        parent_id=parent_id if parent_id else "",
        discipline_autonomy=DisciplineAutonomyAnswers(**(doc.discipline_autonomy or {})),
        emotional_intelligence=EmotionalIntelligenceAnswers(**(doc.emotional_intelligence or {})),
        social_interaction=SocialInteractionAnswers(**(doc.social_interaction or {})),
    )

@router.post("/{child_id}/assessments", response_model=ChildAssessmentPublic)
async def create_child_assessment(
    child_id: str,
    request: Request,
    child: Child = Depends(verify_child_ownership),
):
    """Create assessment - supports both detailed format and simple score format"""
    body = await request.json()
    
    
    if any(key in body for key in ["logic_score", "independence_score", "emotional_score", "discipline_score", "social_score"]):
        
        try:
            simple_assessment = SimpleAssessmentCreate(**body)
            detailed_assessment = simple_assessment.to_detailed_assessment()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid simple assessment format: {str(e)}"
            )
    else:
        
        try:
            detailed_assessment = ChildAssessmentCreate(**body)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid assessment format: {str(e)}"
            )
    
    new_assessment = ChildDevelopmentAssessment(
        child=child,  # type: ignore
        parent=child.parent,  # type: ignore
        discipline_autonomy=detailed_assessment.discipline_autonomy.model_dump(),
        emotional_intelligence=detailed_assessment.emotional_intelligence.model_dump(),
        social_interaction=detailed_assessment.social_interaction.model_dump(),
    )
    await new_assessment.insert()
    return _serialize_assessment(new_assessment)

@router.post("/{child_id}/assessments/simple", response_model=ChildAssessmentPublic)
async def create_simple_assessment(
    child_id: str,
    simple_assessment: SimpleAssessmentCreate,
    child: Child = Depends(verify_child_ownership),
):
    """Create assessment using simple scores (1-10) - converts to detailed format automatically"""
    
    detailed_assessment = simple_assessment.to_detailed_assessment()
    
    new_assessment = ChildDevelopmentAssessment(
        child=child,  # type: ignore
        parent=child.parent,  # type: ignore
        discipline_autonomy=detailed_assessment.discipline_autonomy.model_dump(),
        emotional_intelligence=detailed_assessment.emotional_intelligence.model_dump(),
        social_interaction=detailed_assessment.social_interaction.model_dump(),
    )
    await new_assessment.insert()
    return _serialize_assessment(new_assessment)

@router.get("/{child_id}/assessments", response_model=List[ChildAssessmentPublic])
async def list_child_assessments(
    child_id: str,
    child: Child = Depends(verify_child_ownership),
):
    # Use Beanie's Link comparison pattern
    from app.dependencies import extract_id_from_link
    
    all_assessments = await ChildDevelopmentAssessment.find_all().to_list()
    child_assessments = [
        a for a in all_assessments 
        if extract_id_from_link(a.child) == str(child.id)
    ]
    
    # Sort by created_at if available, otherwise use id (MongoDB ObjectId contains timestamp)
    def get_sort_key(assessment: ChildDevelopmentAssessment) -> datetime:
        if hasattr(assessment, 'created_at') and assessment.created_at:
            return assessment.created_at
        # Fallback: use ObjectId timestamp for existing documents without created_at
        # MongoDB ObjectId contains creation timestamp in first 4 bytes
        from bson import ObjectId
        if isinstance(assessment.id, ObjectId):
            return assessment.id.generation_time
        # Last resort: use current time
        return datetime.utcnow()
    
    child_assessments.sort(key=get_sort_key, reverse=True)
    return [_serialize_assessment(a) for a in child_assessments]

@router.get("/{child_id}/assessments/{assessment_id}", response_model=ChildAssessmentPublic)
async def get_child_assessment(
    child_id: str,
    assessment_id: str,
    child: Child = Depends(verify_child_ownership),
):
    assessment = await ChildDevelopmentAssessment.get(assessment_id)
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found."
        )
    link_child_id = _extract_link_id(assessment.child)
    if link_child_id != str(child.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this assessment."
        )
    return _serialize_assessment(assessment)

@router.put("/{child_id}/assessments/{assessment_id}", response_model=ChildAssessmentPublic)
async def update_child_assessment(
    child_id: str,
    assessment_id: str,
    request: Request,
    child: Child = Depends(verify_child_ownership),
):
    """Update assessment - supports both detailed format and simple score format"""
    assessment = await ChildDevelopmentAssessment.get(assessment_id)
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found."
        )
    link_child_id = _extract_link_id(assessment.child)
    if link_child_id != str(child.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this assessment."
        )

    body = await request.json()
    
    
    if any(key in body for key in ["logic_score", "independence_score", "emotional_score", "discipline_score", "social_score"]):
        
        try:
            simple_update = SimpleAssessmentUpdate(**body)
            updates = simple_update.to_detailed_update(assessment)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid simple assessment format: {str(e)}"
            )
    else:
        
        try:
            updates = ChildAssessmentUpdate(**body)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid assessment format: {str(e)}"
            )

    if updates.discipline_autonomy is not None:
        assessment.discipline_autonomy = updates.discipline_autonomy.model_dump()
    if updates.emotional_intelligence is not None:
        assessment.emotional_intelligence = updates.emotional_intelligence.model_dump()
    if updates.social_interaction is not None:
        assessment.social_interaction = updates.social_interaction.model_dump()

    await assessment.save()
    return _serialize_assessment(assessment)
