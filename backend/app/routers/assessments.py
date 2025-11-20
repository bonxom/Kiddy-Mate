from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import verify_child_ownership
from app.models.child_models import Child, ChildDevelopmentAssessment
from app.schemas.schemas import (
    ChildAssessmentCreate,
    ChildAssessmentPublic,
    ChildAssessmentUpdate,
    DisciplineAutonomyAnswers,
    EmotionalIntelligenceAnswers,
    SocialInteractionAnswers,
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
    return ChildAssessmentPublic(
        id=str(doc.id),
        child_id=_extract_link_id(doc.child),
        parent_id=_extract_link_id(doc.parent),
        discipline_autonomy=DisciplineAutonomyAnswers(**(doc.discipline_autonomy or {})),
        emotional_intelligence=EmotionalIntelligenceAnswers(**(doc.emotional_intelligence or {})),
        social_interaction=SocialInteractionAnswers(**(doc.social_interaction or {})),
    )

@router.post("/{child_id}/assessments", response_model=ChildAssessmentPublic)
async def create_child_assessment(
    child_id: str,
    assessment: ChildAssessmentCreate,
    child: Child = Depends(verify_child_ownership),
):
    new_assessment = ChildDevelopmentAssessment(
        child=child,
        parent=child.parent,
        discipline_autonomy=assessment.discipline_autonomy.model_dump(),
        emotional_intelligence=assessment.emotional_intelligence.model_dump(),
        social_interaction=assessment.social_interaction.model_dump(),
    )
    await new_assessment.insert()
    return _serialize_assessment(new_assessment)

@router.get("/{child_id}/assessments", response_model=List[ChildAssessmentPublic])
async def list_child_assessments(
    child_id: str,
    child: Child = Depends(verify_child_ownership),
):
    query = ChildDevelopmentAssessment.find(
        ChildDevelopmentAssessment.child.id == child.id
    ).sort("-created_at")
    assessments = await query.to_list()
    return [_serialize_assessment(a) for a in assessments]

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
    updates: ChildAssessmentUpdate,
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

    if updates.discipline_autonomy is not None:
        assessment.discipline_autonomy = updates.discipline_autonomy.model_dump()
    if updates.emotional_intelligence is not None:
        assessment.emotional_intelligence = updates.emotional_intelligence.model_dump()
    if updates.social_interaction is not None:
        assessment.social_interaction = updates.social_interaction.model_dump()

    assessment.updated_at = datetime.utcnow()
    await assessment.save()
    return _serialize_assessment(assessment)
