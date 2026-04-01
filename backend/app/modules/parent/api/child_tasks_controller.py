from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from app.core.security.dependencies import (
    require_child_principal,
    require_parent_principal,
    resolve_child_for_current_actor,
)
from app.modules.children.domain.models import Child
from app.modules.identity.domain.models import User
from app.modules.tasks.application import task_service as service
from app.schemas.schemas import ChildTaskPublic, ChildTaskWithDetails, TaskPublic

router = APIRouter()


@router.get("/{child_id}/tasks/suggested", response_model=List[TaskPublic])
async def get_suggested_tasks(
    child_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
) -> List[TaskPublic]:
    return await service.get_suggested_tasks(child_id=child_id, child=child)


@router.get("/{child_id}/tasks", response_model=List[ChildTaskWithDetails])
async def get_child_tasks(
    child_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
    limit: Optional[int] = Query(None, description="Limit number of results"),
    category: Optional[str] = Query(None, description="Filter by task category"),
    status_filter: Optional[service.ChildTaskStatus] = Query(
        None,
        alias="status",
        description="Filter by task status",
    ),
) -> List[ChildTaskWithDetails]:
    return await service.get_child_tasks(
        child_id=child_id,
        child=child,
        limit=limit,
        category=category,
        status_filter=status_filter,
    )


@router.post("/{child_id}/tasks/{task_id}/start", response_model=ChildTaskPublic)
async def start_task(
    child_id: str,
    task_id: str,
    request: service.AssignTaskRequest = service.AssignTaskRequest(),
    child: Child = Depends(resolve_child_for_current_actor),
    current_user: User = Depends(require_child_principal),
) -> ChildTaskPublic:
    return await service.start_task(
        child_id=child_id,
        task_id=task_id,
        request=request,
        child=child,
        current_user=current_user,
    )


@router.post("/{child_id}/tasks/{task_id}/assign", response_model=ChildTaskWithDetails)
async def assign_task_to_child(
    child_id: str,
    task_id: str,
    request: service.AssignTaskRequest,
    child: Child = Depends(resolve_child_for_current_actor),
    current_user: User = Depends(require_parent_principal),
) -> ChildTaskWithDetails:
    return await service.assign_task_to_child(
        child_id=child_id,
        task_id=task_id,
        request=request,
        child=child,
        current_user=current_user,
    )


@router.post("/{child_id}/tasks/{child_task_id}/complete", response_model=dict)
async def complete_task(
    child_id: str,
    child_task_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
    current_user: User = Depends(require_child_principal),
) -> dict:
    return await service.complete_task(
        child_id=child_id,
        child_task_id=child_task_id,
        child=child,
        current_user=current_user,
    )


@router.post("/{child_id}/tasks/{child_task_id}/verify", response_model=dict)
async def verify_task(
    child_id: str,
    child_task_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
    current_user: User = Depends(require_parent_principal),
) -> dict:
    return await service.verify_task(
        child_id=child_id,
        child_task_id=child_task_id,
        child=child,
        current_user=current_user,
    )


@router.post("/{child_id}/tasks/{child_task_id}/reject", response_model=dict)
async def reject_task_verification(
    child_id: str,
    child_task_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
    current_user: User = Depends(require_parent_principal),
) -> dict:
    return await service.reject_task_verification(
        child_id=child_id,
        child_task_id=child_task_id,
        child=child,
        current_user=current_user,
    )


@router.put("/{child_id}/tasks/{child_task_id}", response_model=ChildTaskWithDetails)
async def update_assigned_task(
    child_id: str,
    child_task_id: str,
    task_update: service.ChildTaskUpdateRequest,
    child: Child = Depends(resolve_child_for_current_actor),
) -> ChildTaskWithDetails:
    return await service.update_assigned_task(
        child_id=child_id,
        child_task_id=child_task_id,
        task_update=task_update,
        child=child,
    )


@router.post("/{child_id}/tasks/create-and-assign", response_model=ChildTaskWithDetails)
async def create_and_assign_task(
    child_id: str,
    request: service.CreateAndAssignTaskRequest,
    child: Child = Depends(resolve_child_for_current_actor),
) -> ChildTaskWithDetails:
    return await service.create_and_assign_task(
        child_id=child_id,
        request=request,
        child=child,
    )


@router.delete("/{child_id}/tasks/{child_task_id}", response_model=dict)
async def delete_assigned_task(
    child_id: str,
    child_task_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
) -> dict:
    return await service.delete_assigned_task(
        child_id=child_id,
        child_task_id=child_task_id,
        child=child,
    )


@router.get("/{child_id}/tasks/{task_id}/status", response_model=dict)
async def check_task_status(
    child_id: str,
    task_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
    current_user: User = Depends(require_child_principal),
) -> dict:
    return await service.check_task_status(
        child_id=child_id,
        task_id=task_id,
        child=child,
        current_user=current_user,
    )


@router.post("/{child_id}/tasks/{task_id}/giveup", response_model=dict)
async def giveup_task(
    child_id: str,
    task_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
) -> dict:
    return await service.giveup_task(
        child_id=child_id,
        task_id=task_id,
        child=child,
    )


@router.post("/{child_id}/tasks/unassigned", response_model=List[ChildTaskWithDetails])
async def get_unassigned_tasks(
    child_id: str,
    category: Optional[str] = Query(None),
    child: Child = Depends(resolve_child_for_current_actor),
    current_user: User = Depends(require_child_principal),
) -> List[ChildTaskWithDetails]:
    return await service.get_unassigned_tasks(
        child_id=child_id,
        child=child,
        current_user=current_user,
        category=category,
    )


@router.post("/{child_id}/tasks/giveup", response_model=List[ChildTaskWithDetails])
async def get_giveup_tasks(
    child_id: str,
    child: Child = Depends(resolve_child_for_current_actor),
    current_user: User = Depends(require_parent_principal),
) -> List[ChildTaskWithDetails]:
    return await service.get_giveup_tasks(
        child_id=child_id,
        child=child,
        current_user=current_user,
    )


@router.get("/{child_id}/tasks/completed", response_model=List[ChildTaskWithDetails])
async def get_completed_tasks(
    child_id: str,
    limit: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    child: Child = Depends(resolve_child_for_current_actor),
    current_user: User = Depends(require_child_principal),
) -> List[ChildTaskWithDetails]:
    return await service.get_completed_tasks(
        child_id=child_id,
        child=child,
        current_user=current_user,
        limit=limit,
        category=category,
    )
