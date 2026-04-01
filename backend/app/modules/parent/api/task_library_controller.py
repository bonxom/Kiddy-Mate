from typing import List

from fastapi import APIRouter, Depends

from app.modules.identity.domain.models import User
from app.modules.tasks.application import task_library_service as service
from app.schemas.schemas import TaskPublic
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/tasks", response_model=List[TaskPublic])
async def list_all_tasks(current_user: User = Depends(get_current_user)) -> List[TaskPublic]:
    return await service.list_all_tasks(current_user=current_user)


@router.post("/tasks", response_model=TaskPublic)
async def create_task(
    task: service.TaskCreate,
    current_user: User = Depends(get_current_user),
) -> TaskPublic:
    return await service.create_task(task=task, current_user=current_user)


@router.put("/tasks/{task_id}", response_model=TaskPublic)
async def update_task(
    task_id: str,
    task_update: service.TaskUpdateRequest,
    current_user: User = Depends(get_current_user),
) -> TaskPublic:
    return await service.update_task(
        task_id=task_id,
        task_update=task_update,
        current_user=current_user,
    )


@router.delete("/tasks/{task_id}", response_model=dict)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
) -> dict:
    return await service.delete_task(task_id=task_id, current_user=current_user)
