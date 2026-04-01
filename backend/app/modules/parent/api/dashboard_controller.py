from typing import Dict, List, Optional

from fastapi import APIRouter, Depends

from app.core.security.dependencies import require_parent_principal, resolve_child_for_current_actor
from app.modules.children.domain.models import Child
from app.modules.dashboard.application import dashboard_service as service
from app.modules.identity.domain.models import User
from app.schemas.schemas import ChildTaskWithDetails

router = APIRouter()


@router.get("/{child_id}", response_model=Dict)
async def get_dashboard(
    child: Child = Depends(resolve_child_for_current_actor),
) -> Dict:
    return await service.get_dashboard(child=child)


@router.get("/{child_id}/category-progress", response_model=List[service.CategoryProgressItem])
async def get_category_progress(
    child: Child = Depends(resolve_child_for_current_actor),
) -> List[service.CategoryProgressItem]:
    return await service.get_category_progress(child=child)


@router.get("/{child_id}/emotion-analytics", response_model=service.EmotionAnalyticsResponse)
async def get_emotion_analytics(
    child_id: str,
    report_id: Optional[str] = None,
    child: Child = Depends(resolve_child_for_current_actor),
    current_user: User = Depends(require_parent_principal),
) -> service.EmotionAnalyticsResponse:
    return await service.get_emotion_analytics(
        child_id=child_id,
        report_id=report_id,
        child=child,
        current_user=current_user,
    )


@router.post("/{child_id}/analyze-emotion-report", response_model=List[ChildTaskWithDetails])
async def analyze_emotion_report_and_generate_tasks(
    child_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
    current_user: User = Depends(require_parent_principal),
) -> List[ChildTaskWithDetails]:
    return await service.analyze_emotion_report_and_generate_tasks(
        child_id=child_id,
        child=child,
        current_user=current_user,
    )


@router.post("/{child_id}/update-skills", response_model=Dict)
async def manual_update_skills(
    child_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
    current_user: User = Depends(require_parent_principal),
) -> Dict:
    return await service.manual_update_skills(
        child_id=child_id,
        child=child,
        current_user=current_user,
    )
