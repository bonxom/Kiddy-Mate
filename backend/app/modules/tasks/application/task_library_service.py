"""Parent task library use cases."""

from typing import Optional

from app.modules.identity.domain.models import User
from app.modules.identity.domain.models import UserRole
from app.modules.tasks.domain.errors import TaskLibraryAccessDeniedError, TaskNotFoundError
from pydantic import BaseModel

from app.modules.tasks.domain.models import Task, TaskCategory, TaskType, UnityType
from app.modules.tasks.domain.repositories import TaskLibraryRepository
from app.modules.tasks.infrastructure.task_library_repository import BeanieTaskLibraryRepository
from app.schemas.schemas import TaskCreate, TaskPublic

class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[TaskCategory] = None
    type: Optional[TaskType] = None
    difficulty: Optional[int] = None
    suggested_age_range: Optional[str] = None
    reward_coins: Optional[int] = None
    reward_badge_name: Optional[str] = None
    unity_type: Optional[UnityType] = None

task_library_repository: TaskLibraryRepository = BeanieTaskLibraryRepository()


def _ensure_parent_user(current_user: User) -> None:
    if current_user.role != UserRole.PARENT:
        raise TaskLibraryAccessDeniedError("Task library is available to parent accounts only.")


def _to_task_public(task: Task) -> TaskPublic:
    return TaskPublic(
        id=str(task.id),
        title=task.title,
        description=task.description,
        category=task.category,
        type=task.type,
        difficulty=task.difficulty,
        suggested_age_range=task.suggested_age_range,
        reward_coins=task.reward_coins,
        reward_badge_name=task.reward_badge_name,
        unity_type=task.unity_type.value if task.unity_type else None,
    )


async def list_all_tasks(
    current_user: User,
) -> list[TaskPublic]:
    _ensure_parent_user(current_user)
    tasks = await task_library_repository.list_all()
    return [_to_task_public(task) for task in tasks]

async def create_task(
    task: TaskCreate,
    current_user: User,
) -> TaskPublic:
    _ensure_parent_user(current_user)
    unity_type_value = None
    if task.unity_type:
        unity_type_value = UnityType(task.unity_type)

    new_task = Task(
        title=task.title,
        description=task.description,
        category=task.category,
        type=task.type,
        difficulty=task.difficulty,
        suggested_age_range=task.suggested_age_range,
        reward_coins=task.reward_coins if task.reward_coins is not None else 50,
        reward_badge_name=task.reward_badge_name,
        unity_type=unity_type_value,
    )
    created_task = await task_library_repository.create(new_task)
    return _to_task_public(created_task)

async def update_task(
    task_id: str,
    task_update: TaskUpdateRequest,
    current_user: User,
) -> TaskPublic:
    _ensure_parent_user(current_user)
    task = await task_library_repository.get(task_id)
    if not task:
        raise TaskNotFoundError(f"Task '{task_id}' not found.")

    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.category is not None:
        task.category = task_update.category
    if task_update.type is not None:
        task.type = task_update.type
    if task_update.difficulty is not None:
        task.difficulty = task_update.difficulty
    if task_update.suggested_age_range is not None:
        task.suggested_age_range = task_update.suggested_age_range
    if task_update.reward_coins is not None:
        task.reward_coins = task_update.reward_coins
    if task_update.reward_badge_name is not None:
        task.reward_badge_name = task_update.reward_badge_name
    if task_update.unity_type is not None:
        task.unity_type = task_update.unity_type

    updated_task = await task_library_repository.save(task)
    return _to_task_public(updated_task)

async def delete_task(
    task_id: str,
    current_user: User,
) -> dict:
    _ensure_parent_user(current_user)
    task = await task_library_repository.get(task_id)
    if not task:
        raise TaskNotFoundError(f"Task '{task_id}' not found.")

    await task_library_repository.delete_assignments_for_task(task_id)
    await task_library_repository.delete(task)
    return {"message": f"Task {task_id} deleted successfully."}
