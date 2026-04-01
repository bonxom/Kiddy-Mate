from typing import List

from fastapi import APIRouter, Depends

from app.core.security.dependencies import resolve_child_for_current_actor
from app.modules.assessments.application import assessment_service as service
from app.modules.children.domain.models import Child
from app.schemas.schemas import ChildAssessmentPublic

router = APIRouter()


@router.post("/{child_id}/assessments", response_model=ChildAssessmentPublic)
async def create_child_assessment(
    child_id: str,
    assessment: service.ChildAssessmentCreate,
    child: Child = Depends(resolve_child_for_current_actor),
) -> ChildAssessmentPublic:
    return await service.create_child_assessment(
        child_id=child_id,
        assessment=assessment,
        child=child,
    )


@router.post("/{child_id}/assessments/simple", response_model=ChildAssessmentPublic)
async def create_simple_assessment(
    child_id: str,
    assessment: service.SimpleAssessmentCreate,
    child: Child = Depends(resolve_child_for_current_actor),
) -> ChildAssessmentPublic:
    return await service.create_simple_assessment(
        child_id=child_id,
        assessment=assessment,
        child=child,
    )


@router.get("/{child_id}/assessments", response_model=List[ChildAssessmentPublic])
async def list_child_assessments(
    child_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
) -> List[ChildAssessmentPublic]:
    return await service.list_child_assessments(child_id=child_id, child=child)


@router.get("/{child_id}/assessments/{assessment_id}", response_model=ChildAssessmentPublic)
async def get_child_assessment(
    child_id: str,
    assessment_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
) -> ChildAssessmentPublic:
    return await service.get_child_assessment(
        child_id=child_id,
        assessment_id=assessment_id,
        child=child,
    )


@router.put("/{child_id}/assessments/{assessment_id}", response_model=ChildAssessmentPublic)
async def update_child_assessment(
    child_id: str,
    assessment_id: str,
    assessment_update: service.ChildAssessmentUpdate,
    child: Child = Depends(resolve_child_for_current_actor),
) -> ChildAssessmentPublic:
    return await service.update_child_assessment(
        child_id=child_id,
        assessment_id=assessment_id,
        assessment_update=assessment_update,
        child=child,
    )
