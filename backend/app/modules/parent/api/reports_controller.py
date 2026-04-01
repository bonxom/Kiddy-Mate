from typing import List

from fastapi import APIRouter, Depends

from app.core.security.dependencies import require_parent_principal, resolve_child_for_current_actor
from app.modules.children.domain.models import Child
from app.modules.identity.domain.models import User
from app.modules.reports.application import report_service as service
from app.schemas.schemas import ReportPublic

router = APIRouter()


@router.get("/{child_id}", response_model=List[ReportPublic])
async def get_reports(
    child: Child = Depends(resolve_child_for_current_actor),
) -> List[ReportPublic]:
    return await service.get_reports(child=child)


@router.get("/{child_id}/{report_id}", response_model=ReportPublic)
async def get_report(
    child_id: str,
    report_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
) -> ReportPublic:
    return await service.get_report(child_id=child_id, report_id=report_id, child=child)


@router.post("/{child_id}/generate", response_model=ReportPublic)
async def generate_report(
    child_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
    current_user: User = Depends(require_parent_principal),
) -> ReportPublic:
    return await service.generate_report(
        child_id=child_id,
        child=child,
        current_user=current_user,
    )
