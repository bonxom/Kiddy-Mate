from typing import Protocol

from app.modules.tasks.domain.models import Task


class TaskLibraryRepository(Protocol):
    async def list_all(self) -> list[Task]:
        ...

    async def get(self, task_id: str) -> Task | None:
        ...

    async def save(self, task: Task) -> Task:
        ...

    async def create(self, task: Task) -> Task:
        ...

    async def delete(self, task: Task) -> None:
        ...

    async def delete_assignments_for_task(self, task_id: str) -> None:
        ...
