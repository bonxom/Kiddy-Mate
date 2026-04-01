from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.security.child_context import ChildAuthContext
from app.core.security.dependencies import get_authenticated_child, require_child_auth_context
from app.modules.child.application import task_service as service
from app.modules.children.domain.models import Child
from app.schemas.schemas import ChildTaskPublic, ChildTaskWithDetails

router = APIRouter()


@router.get("/me/tasks", response_model=list[ChildTaskWithDetails])
async def get_my_tasks(
    limit: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[service.ChildTaskStatus] = Query(None, alias="status"),
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> list[ChildTaskWithDetails]:
    return await service.list_tasks(
        child=child,
        filters=service.TaskListFilters(limit=limit, category=category, status=status),
        context=context,
    )


@router.post("/me/tasks/{task_id}/start", response_model=ChildTaskPublic)
async def start_my_task(
    task_id: str,
    request: service.StartTaskRequest = service.StartTaskRequest(),
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> ChildTaskPublic:
    return await service.start_task(
        task_id=task_id,
        request=request,
        child=child,
        context=context,
    )


@router.post("/me/tasks/{child_task_id}/complete", response_model=dict)
async def complete_my_task(
    child_task_id: str,
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> dict:
    return await service.complete_task(
        child_task_id=child_task_id,
        child=child,
        context=context,
    )


@router.get("/me/tasks/{task_id}/status", response_model=dict)
async def get_my_task_status(
    task_id: str,
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> dict:
    return await service.get_task_status(
        task_id=task_id,
        child=child,
        context=context,
    )


@router.post("/me/tasks/{task_id}/giveup", response_model=dict)
async def giveup_my_task(
    task_id: str,
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> dict:
    return await service.give_up_task(
        task_id=task_id,
        child=child,
        context=context,
    )


@router.get("/me/tasks/unassigned", response_model=list[ChildTaskWithDetails])
async def get_my_unassigned_tasks(
    category: Optional[str] = Query(None),
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> list[ChildTaskWithDetails]:
    return await service.list_unassigned_tasks(
        child=child,
        category=category,
        context=context,
    )


@router.get("/me/tasks/completed", response_model=list[ChildTaskWithDetails])
async def get_my_completed_tasks(
    limit: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    child: Child = Depends(get_authenticated_child),
    context: ChildAuthContext = Depends(require_child_auth_context),
) -> list[ChildTaskWithDetails]:
    return await service.list_completed_tasks(
        child=child,
        limit=limit,
        category=category,
        context=context,
    )
