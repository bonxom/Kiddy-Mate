from app.models.childtask_models import ChildTask
from app.modules.tasks.domain.models import Task


class BeanieTaskLibraryRepository:
    async def list_all(self) -> list[Task]:
        return await Task.find_all().to_list()

    async def get(self, task_id: str) -> Task | None:
        return await Task.get(task_id)

    async def save(self, task: Task) -> Task:
        await task.save()
        return task

    async def create(self, task: Task) -> Task:
        await task.insert()
        return task

    async def delete(self, task: Task) -> None:
        await task.delete()

    async def delete_assignments_for_task(self, task_id: str) -> None:
        await ChildTask.find(ChildTask.task.id == task_id).delete()  # type: ignore[arg-type]
