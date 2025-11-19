from beanie import Document, Link
from datetime import datetime
from typing import Optional
from app.models.child_models import Child
from app.models.task_models import Task
import enum

class ChildTaskStatus(str, enum.Enum):
    SUGGESTED = "suggested"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    VERIFIED = "verified"

class ChildTask(Document):
    child: Link[Child]
    task: Link[Task]
    status: ChildTaskStatus = ChildTaskStatus.SUGGESTED
    assigned_at: datetime = datetime.utcnow()
    completed_at: Optional[datetime] = None

    class Settings:
        name = "child_tasks"

