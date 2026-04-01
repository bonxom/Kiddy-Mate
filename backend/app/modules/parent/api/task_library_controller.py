from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security.dependencies import require_parent_principal
from app.modules.identity.domain.models import User
from app.modules.tasks.application import task_library_service as service
from app.modules.tasks.domain.errors import TaskLibraryAccessDeniedError, TaskNotFoundError
from app.schemas.schemas import TaskPublic

router = APIRouter()


def _raise_task_library_http_error(error: Exception) -> None:
    if isinstance(error, TaskNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
    if isinstance(error, TaskLibraryAccessDeniedError):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(error))
    raise error


@router.get("/tasks", response_model=List[TaskPublic])
async def list_all_tasks(current_user: User = Depends(require_parent_principal)) -> List[TaskPublic]:
    try:
        return await service.list_all_tasks(current_user=current_user)
    except Exception as error:
        _raise_task_library_http_error(error)


@router.post("/tasks", response_model=TaskPublic)
async def create_task(
    task: service.TaskCreate,
    current_user: User = Depends(require_parent_principal),
) -> TaskPublic:
    try:
        return await service.create_task(task=task, current_user=current_user)
    except Exception as error:
        _raise_task_library_http_error(error)


@router.put("/tasks/{task_id}", response_model=TaskPublic)
async def update_task(
    task_id: str,
    task_update: service.TaskUpdateRequest,
    current_user: User = Depends(require_parent_principal),
) -> TaskPublic:
    try:
        return await service.update_task(
            task_id=task_id,
            task_update=task_update,
            current_user=current_user,
        )
    except Exception as error:
        _raise_task_library_http_error(error)


@router.delete("/tasks/{task_id}", response_model=dict)
async def delete_task(
    task_id: str,
    current_user: User = Depends(require_parent_principal),
) -> dict:
    try:
        return await service.delete_task(task_id=task_id, current_user=current_user)
    except Exception as error:
        _raise_task_library_http_error(error)
