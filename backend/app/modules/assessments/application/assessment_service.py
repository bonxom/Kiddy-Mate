from datetime import datetime
from app.core.time import utc_now
from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, status, Body
from beanie import Link
from app.shared.query_helpers import extract_id_from_link
from app.modules.children.domain.models import Child, ChildDevelopmentAssessment
from app.modules.identity.domain.models import User
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

async def create_child_assessment(
    child_id: str,
    assessment: ChildAssessmentCreate,
    child: Child = None,
):
    new_assessment = ChildDevelopmentAssessment(
        child=child,  # type: ignore
        parent=child.parent,  # type: ignore
        discipline_autonomy=assessment.discipline_autonomy.model_dump(),
        emotional_intelligence=assessment.emotional_intelligence.model_dump(),
        social_interaction=assessment.social_interaction.model_dump(),
    )
    await new_assessment.insert()
    return _serialize_assessment(new_assessment)

async def create_simple_assessment(
    child_id: str,
    simple_assessment: SimpleAssessmentCreate,
    child: Child = None,
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

async def list_child_assessments(
    child_id: str,
    child: Child = None,
):
    # Use Beanie's Link comparison pattern
    from app.shared.query_helpers import extract_id_from_link
    
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
        return utc_now()
    
    child_assessments.sort(key=get_sort_key, reverse=True)
    return [_serialize_assessment(a) for a in child_assessments]

async def get_child_assessment(
    child_id: str,
    assessment_id: str,
    child: Child = None,
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

async def update_child_assessment(
    child_id: str,
    assessment_id: str,
    assessment_update: ChildAssessmentUpdate,
    child: Child = None,
):
    """Update assessment using the detailed assessment DTO."""
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

    if assessment_update.discipline_autonomy is not None:
        assessment.discipline_autonomy = assessment_update.discipline_autonomy.model_dump()
    if assessment_update.emotional_intelligence is not None:
        assessment.emotional_intelligence = assessment_update.emotional_intelligence.model_dump()
    if assessment_update.social_interaction is not None:
        assessment.social_interaction = assessment_update.social_interaction.model_dump()

    await assessment.save()
    return _serialize_assessment(assessment)
