from beanie import Document, Link
from datetime import datetime
from typing import Optional
from app.models.child_models import Child
from app.models.task_models import Task
import enum

class ChildTaskStatus(str, enum.Enum):
    UNASSIGNED = "unassigned"
    IN_PROGRESS = "in_progress"
    NEED_VERIFY = "need_verify"
    COMPLETED = "completed"

class ChildTaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class ChildTask(Document):
    child: Link[Child]
    task: Link[Task]
    status: ChildTaskStatus = ChildTaskStatus.UNASSIGNED
    assigned_at: datetime = datetime.utcnow()
    completed_at: Optional[datetime] = None
    
    # New fields for enhanced task management
    priority: Optional[ChildTaskPriority] = None
    due_date: Optional[datetime] = None
    progress: int = 0  # 0-100 percentage
    notes: Optional[str] = None

    class Settings:
        name = "child_tasks"
