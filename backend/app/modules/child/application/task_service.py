from __future__ import annotations

from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel

from app.core.security.child_context import ChildAuthContext, build_child_auth_context
from app.core.time import utc_now
from app.modules.child.domain.errors import ChildForbiddenError, ChildNotFoundError, ChildValidationError
from app.modules.child.domain.task_repositories import ChildTaskRepository
from app.modules.child.infrastructure.task_repository import BeanieChildTaskRepository
from app.modules.children.domain.models import Child
from app.modules.tasks.domain.models import ChildTask, ChildTaskPriority, ChildTaskStatus, Task
from app.schemas.schemas import ChildTaskPublic, ChildTaskWithDetails, TaskPublic
from app.shared.query_helpers import extract_id_from_link


class TaskListFilters(BaseModel):
    limit: Optional[int] = None
    category: Optional[str] = None
    status: Optional[ChildTaskStatus] = None


class StartTaskRequest(BaseModel):
    due_date: Optional[str] = None
    priority: Optional[ChildTaskPriority] = None
    notes: Optional[str] = None
    custom_title: Optional[str] = None
    custom_reward_coins: Optional[int] = None
    custom_category: Optional[str] = None


def _child_context(child: Child) -> ChildAuthContext:
    return build_child_auth_context(child=child)


def _repository(repository: ChildTaskRepository | None = None) -> ChildTaskRepository:
    return repository or BeanieChildTaskRepository()


def _parse_date_string(date_str: Optional[str]) -> Optional[datetime]:
    if not date_str:
        return None
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        return datetime.combine(date_obj.date(), time.min)
    except ValueError as exc:
        raise ChildValidationError("Invalid due_date format. Expected YYYY-MM-DD.") from exc


def _assert_child_owns_task(child_task: ChildTask, child: Child) -> None:
    task_child_id = extract_id_from_link(child_task.child)
    if task_child_id != str(child.id):
        raise ChildForbiddenError("You do not own this task.")


def _merge_task_details(child_task: ChildTask, task_source) -> dict:
    reward_coins = 0
    if child_task.custom_reward_coins is not None:
        reward_coins = child_task.custom_reward_coins
    elif hasattr(task_source, "reward_coins") and task_source.reward_coins is not None:
        reward_coins = task_source.reward_coins

    return {
        "title": child_task.custom_title if child_task.custom_title else task_source.title,
        "reward_coins": reward_coins,
        "category": child_task.custom_category if child_task.custom_category else task_source.category,
        "description": task_source.description,
        "type": task_source.type,
        "difficulty": task_source.difficulty,
        "suggested_age_range": task_source.suggested_age_range,
        "reward_badge_name": task_source.reward_badge_name,
        "unity_type": task_source.unity_type.value if hasattr(task_source, "unity_type") and task_source.unity_type else None,
    }


async def _build_task_details_response(
    child_task: ChildTask,
    repository: ChildTaskRepository,
) -> ChildTaskWithDetails:
    task_source = await repository.load_task_source(child_task)
    if not task_source:
        raise ChildNotFoundError("Task not found.")

    if child_task.task:
        task_id = extract_id_from_link(child_task.task)
        if not task_id:
            raise ChildNotFoundError("Task not found.")
    else:
        task_id = f"custom-{child_task.id}"

    merged_details = _merge_task_details(child_task, task_source)

    return ChildTaskWithDetails(
        id=str(child_task.id),
        status=child_task.status,
        assigned_at=child_task.assigned_at,
        completed_at=child_task.completed_at,
        priority=child_task.priority.value if child_task.priority else None,
        due_date=child_task.due_date,
        progress=child_task.progress,
        notes=child_task.notes,
        custom_title=child_task.custom_title,
        custom_reward_coins=child_task.custom_reward_coins,
        custom_category=child_task.custom_category,
        unity_type=child_task.unity_type.value if child_task.unity_type else None,
        task=TaskPublic(
            id=task_id,
            title=merged_details["title"],
            description=merged_details["description"],
            category=merged_details["category"],
            type=merged_details["type"],
            difficulty=merged_details["difficulty"],
            suggested_age_range=merged_details["suggested_age_range"],
            reward_coins=merged_details["reward_coins"],
            reward_badge_name=merged_details["reward_badge_name"],
            unity_type=merged_details["unity_type"],
        ),
    )


async def list_tasks(
    child: Child,
    filters: TaskListFilters,
    context: ChildAuthContext | None = None,
    repository: ChildTaskRepository | None = None,
) -> list[ChildTaskWithDetails]:
    _ = context or _child_context(child)
    repo = _repository(repository)
    child_tasks = await repo.list_child_tasks(child)
    if filters.status:
        child_tasks = [task for task in child_tasks if task.status == filters.status]
    child_tasks = sorted(child_tasks, key=lambda task: task.assigned_at, reverse=True)

    results: list[ChildTaskWithDetails] = []
    for child_task in child_tasks:
        task_source = await repo.load_task_source(child_task)
        if not task_source:
            continue
        if filters.category and task_source.category != filters.category:
            continue
        results.append(await _build_task_details_response(child_task, repo))

    if filters.limit:
        results = results[: filters.limit]
    return results


async def start_task(
    task_id: str,
    request: StartTaskRequest,
    child: Child,
    context: ChildAuthContext | None = None,
    repository: ChildTaskRepository | None = None,
) -> ChildTaskPublic:
    _ = context or _child_context(child)
    repo = _repository(repository)
    task = await repo.get_library_task(task_id)
    if not task:
        raise ChildNotFoundError(
            "Task not found. Use /child/me/tasks or /parent/tasks to get a valid task id."
        )

    child_tasks = await repo.list_child_tasks(child)
    existing = next(
        (child_task for child_task in child_tasks if extract_id_from_link(child_task.task) == task_id),
        None,
    )
    if existing:
        if existing.status in {ChildTaskStatus.UNASSIGNED, ChildTaskStatus.ASSIGNED, ChildTaskStatus.GIVEUP}:
            existing.status = ChildTaskStatus.IN_PROGRESS
            existing.assigned_at = utc_now()
            if request.due_date is not None:
                existing.due_date = _parse_date_string(request.due_date)
            if request.priority is not None:
                existing.priority = request.priority
            if request.notes is not None:
                existing.notes = request.notes
            existing = await repo.save_child_task(existing)
        elif existing.status == ChildTaskStatus.IN_PROGRESS:
            pass
        elif existing.status == ChildTaskStatus.NEED_VERIFY:
            raise ChildValidationError(
                "Task is already completed and waiting for parent verification."
            )
        elif existing.status == ChildTaskStatus.COMPLETED:
            raise ChildValidationError("Task has already been completed and verified.")
        elif existing.status == ChildTaskStatus.MISSED:
            raise ChildValidationError("Task has been missed and cannot be started again.")
        else:
            raise ChildValidationError(
                f"Task cannot be started from status '{existing.status.value}'."
            )

        return ChildTaskPublic(
            id=str(existing.id),
            status=existing.status,
            assigned_at=existing.assigned_at,
            completed_at=existing.completed_at,
        )

    new_child_task = ChildTask(
        child=child,  # type: ignore[arg-type]
        task=task,  # type: ignore[arg-type]
        status=ChildTaskStatus.IN_PROGRESS,
        assigned_at=utc_now(),
        due_date=_parse_date_string(request.due_date),
        priority=request.priority,
        notes=request.notes,
    )
    new_child_task = await repo.insert_child_task(new_child_task)
    return ChildTaskPublic(
        id=str(new_child_task.id),
        status=new_child_task.status,
        assigned_at=new_child_task.assigned_at,
        completed_at=new_child_task.completed_at,
    )


async def complete_task(
    child_task_id: str,
    child: Child,
    context: ChildAuthContext | None = None,
    repository: ChildTaskRepository | None = None,
) -> dict:
    _ = context or _child_context(child)
    repo = _repository(repository)
    child_task = await repo.get_child_task(child_task_id)
    if not child_task:
        raise ChildNotFoundError("Child task not found.")

    _assert_child_owns_task(child_task, child)

    if child_task.status == ChildTaskStatus.NEED_VERIFY:
        raise ChildValidationError(
            "Task has already been completed and is waiting for parent verification. Cannot complete again."
        )
    if child_task.status == ChildTaskStatus.COMPLETED:
        raise ChildValidationError(
            "Task has already been completed and verified. Cannot complete again."
        )
    if child_task.status == ChildTaskStatus.GIVEUP:
        raise ChildValidationError(
            "Task has been given up. Cannot complete a task that has been given up."
        )
    if child_task.status == ChildTaskStatus.MISSED:
        raise ChildValidationError("Task has been missed. Cannot complete a task that has been missed.")
    if child_task.status not in {ChildTaskStatus.ASSIGNED, ChildTaskStatus.IN_PROGRESS}:
        raise ChildValidationError(
            f"Cannot complete task with status '{child_task.status.value}'. Task must be in 'assigned' or 'in_progress' status."
        )

    child_task.status = ChildTaskStatus.NEED_VERIFY
    child_task.progress = 100
    child_task.completed_at = utc_now()
    await repo.save_child_task(child_task)
    return {"message": "Task completed successfully! Waiting for parent verification."}


async def get_task_status(
    task_id: str,
    child: Child,
    context: ChildAuthContext | None = None,
    repository: ChildTaskRepository | None = None,
) -> dict:
    _ = context or _child_context(child)
    repo = _repository(repository)
    child_tasks = await repo.list_child_tasks(child)
    child_task = next(
        (candidate for candidate in child_tasks if extract_id_from_link(candidate.task) == task_id),
        None,
    )
    if not child_task:
        raise ChildNotFoundError("Task not found for this child.")
    return {"status": child_task.status.value}


async def give_up_task(
    task_id: str,
    child: Child,
    context: ChildAuthContext | None = None,
    repository: ChildTaskRepository | None = None,
) -> dict:
    _ = context or _child_context(child)
    repo = _repository(repository)

    child_task = await repo.get_child_task(task_id)
    if child_task and extract_id_from_link(child_task.child) != str(child.id):
        child_task = None

    if not child_task:
        task = await repo.get_library_task(task_id)
        if not task:
            raise ChildNotFoundError(
                f"Task or ChildTask with ID '{task_id}' not found. Please check the ID and ensure the task is assigned to this child."
            )

        child_tasks = await repo.list_child_tasks(child)
        matching_tasks = [
            candidate
            for candidate in child_tasks
            if extract_id_from_link(candidate.task) == task_id
        ]
        status_priority = {
            ChildTaskStatus.IN_PROGRESS: 0,
            ChildTaskStatus.ASSIGNED: 1,
            ChildTaskStatus.UNASSIGNED: 2,
            ChildTaskStatus.GIVEUP: 3,
            ChildTaskStatus.NEED_VERIFY: 4,
            ChildTaskStatus.COMPLETED: 5,
            ChildTaskStatus.MISSED: 6,
        }
        matching_tasks.sort(key=lambda candidate: status_priority.get(candidate.status, 99))
        child_task = matching_tasks[0] if matching_tasks else None
        if not child_task:
            raise ChildNotFoundError(
                f"Task '{task_id}' is not assigned to this child. Please assign the task first using POST /parent/children/{str(child.id)}/tasks/{task_id}/start"
            )

    _assert_child_owns_task(child_task, child)

    if child_task.status == ChildTaskStatus.GIVEUP:
        return {
            "message": "Task marked as given up successfully.",
            "status": ChildTaskStatus.GIVEUP.value,
        }
    if child_task.status not in {
        ChildTaskStatus.UNASSIGNED,
        ChildTaskStatus.ASSIGNED,
        ChildTaskStatus.IN_PROGRESS,
    }:
        raise ChildValidationError(
            f"Cannot give up task with status '{child_task.status.value}'. Task must be unassigned, assigned, or in progress."
        )

    child_task.status = ChildTaskStatus.GIVEUP
    await repo.save_child_task(child_task)
    return {"message": "Task marked as given up successfully.", "status": ChildTaskStatus.GIVEUP.value}


async def list_unassigned_tasks(
    child: Child,
    category: Optional[str] = None,
    context: ChildAuthContext | None = None,
    repository: ChildTaskRepository | None = None,
) -> list[ChildTaskWithDetails]:
    _ = context or _child_context(child)
    repo = _repository(repository)
    child_tasks = await repo.list_child_tasks(child)
    unassigned_tasks = [task for task in child_tasks if task.status == ChildTaskStatus.UNASSIGNED]
    unassigned_tasks = sorted(unassigned_tasks, key=lambda task: task.assigned_at, reverse=True)

    results: list[ChildTaskWithDetails] = []
    for child_task in unassigned_tasks:
        task_source = await repo.load_task_source(child_task)
        if not isinstance(task_source, Task):
            continue
        if category and task_source.category != category:
            continue
        results.append(await _build_task_details_response(child_task, repo))
    return results


async def list_completed_tasks(
    child: Child,
    limit: Optional[int] = None,
    category: Optional[str] = None,
    context: ChildAuthContext | None = None,
    repository: ChildTaskRepository | None = None,
) -> list[ChildTaskWithDetails]:
    _ = context or _child_context(child)
    repo = _repository(repository)
    child_tasks = await repo.list_child_tasks(child)
    completed_tasks = [task for task in child_tasks if task.status == ChildTaskStatus.COMPLETED]
    completed_tasks = sorted(
        completed_tasks,
        key=lambda task: task.completed_at or task.assigned_at,
        reverse=True,
    )

    results: list[ChildTaskWithDetails] = []
    for child_task in completed_tasks:
        task_source = await repo.load_task_source(child_task)
        if not isinstance(task_source, Task):
            continue
        if category and task_source.category != category:
            continue
        results.append(await _build_task_details_response(child_task, repo))

    if limit:
        results = results[:limit]
    return results
