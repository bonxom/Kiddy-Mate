from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.security.dependencies import get_authenticated_child, require_child_principal
from app.modules.children.domain.models import Child
from app.modules.identity.domain.models import User
from app.modules.tasks.application import task_service as service
from app.schemas.schemas import ChildTaskPublic, ChildTaskWithDetails

router = APIRouter()


@router.get("/me/tasks", response_model=list[ChildTaskWithDetails])
async def get_my_tasks(
    limit: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[service.ChildTaskStatus] = Query(None, alias="status"),
    child: Child = Depends(get_authenticated_child),
) -> list[ChildTaskWithDetails]:
    return await service.get_child_tasks(
        child_id=str(child.id),
        child=child,
        limit=limit,
        category=category,
        status_filter=status,
    )


@router.post("/me/tasks/{task_id}/start", response_model=ChildTaskPublic)
async def start_my_task(
    task_id: str,
    request: service.AssignTaskRequest = service.AssignTaskRequest(),
    child: Child = Depends(get_authenticated_child),
    current_user: User = Depends(require_child_principal),
) -> ChildTaskPublic:
    return await service.start_task(
        child_id=str(child.id),
        task_id=task_id,
        request=request,
        child=child,
        current_user=current_user,
    )


@router.post("/me/tasks/{child_task_id}/complete", response_model=dict)
async def complete_my_task(
    child_task_id: str,
    child: Child = Depends(get_authenticated_child),
    current_user: User = Depends(require_child_principal),
) -> dict:
    return await service.complete_task(
        child_id=str(child.id),
        child_task_id=child_task_id,
        child=child,
        current_user=current_user,
    )


@router.get("/me/tasks/{task_id}/status", response_model=dict)
async def get_my_task_status(
    task_id: str,
    child: Child = Depends(get_authenticated_child),
    current_user: User = Depends(require_child_principal),
) -> dict:
    return await service.check_task_status(
        child_id=str(child.id),
        task_id=task_id,
        child=child,
        current_user=current_user,
    )


@router.post("/me/tasks/{task_id}/giveup", response_model=dict)
async def giveup_my_task(
    task_id: str,
    child: Child = Depends(get_authenticated_child),
) -> dict:
    return await service.giveup_task(
        child_id=str(child.id),
        task_id=task_id,
        child=child,
    )


@router.get("/me/tasks/unassigned", response_model=list[ChildTaskWithDetails])
async def get_my_unassigned_tasks(
    category: Optional[str] = Query(None),
    child: Child = Depends(get_authenticated_child),
    current_user: User = Depends(require_child_principal),
) -> list[ChildTaskWithDetails]:
    return await service.get_unassigned_tasks(
        child_id=str(child.id),
        child=child,
        current_user=current_user,
        category=category,
    )


@router.get("/me/tasks/completed", response_model=list[ChildTaskWithDetails])
async def get_my_completed_tasks(
    limit: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    child: Child = Depends(get_authenticated_child),
    current_user: User = Depends(require_child_principal),
) -> list[ChildTaskWithDetails]:
    return await service.get_completed_tasks(
        child_id=str(child.id),
        child=child,
        current_user=current_user,
        limit=limit,
        category=category,
    )
