from __future__ import annotations

from app.modules.child.domain.task_repositories import ChildTaskRepository
from app.modules.children.domain.models import Child
from app.modules.tasks.domain.models import ChildTask, Task, TaskData
from app.shared.query_helpers import ensure_link_references_for_save, fetch_link_or_get_object, get_child_tasks_by_child


class BeanieChildTaskRepository(ChildTaskRepository):
    async def list_child_tasks(self, child: Child) -> list[ChildTask]:
        return await get_child_tasks_by_child(child)

    async def get_library_task(self, task_id: str) -> Task | None:
        return await Task.get(task_id)

    async def get_child_task(self, child_task_id: str) -> ChildTask | None:
        return await ChildTask.get(child_task_id)

    async def load_task_source(self, child_task: ChildTask) -> Task | TaskData | None:
        if child_task.task:
            return await fetch_link_or_get_object(child_task.task, Task)
        if child_task.task_data:
            return child_task.task_data
        return None

    async def insert_child_task(self, child_task: ChildTask) -> ChildTask:
        await child_task.insert()
        return child_task

    async def save_child_task(self, child_task: ChildTask) -> ChildTask:
        child_doc = await fetch_link_or_get_object(child_task.child, Child)
        if child_doc is not None:
            await ensure_link_references_for_save(child_task, child_doc)
        await child_task.save()
        return child_task

    async def delete_child_task(self, child_task: ChildTask) -> None:
        await child_task.delete()
