from beanie import Document, Link
from datetime import datetime
from typing import Optional
from app.models.child_models import Child
from app.models.task_models import Task
import enum

class ChildTaskStatus(str, enum.Enum):
    ASSIGNED = "assigned"           # Newly assigned task
    IN_PROGRESS = "in_progress"     # Child is working on it
    NEED_VERIFY = "need_verify"     # Waiting for parent verification
    COMPLETED = "completed"         # Task verified and finished
    MISSED = "missed"               # Task not completed by due date

class ChildTaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class ChildTask(Document):
    child: Link[Child]
    task: Link[Task]
    status: ChildTaskStatus = ChildTaskStatus.ASSIGNED
    assigned_at: datetime = datetime.utcnow()
    completed_at: Optional[datetime] = None
    
    # New fields for enhanced task management
    priority: Optional[ChildTaskPriority] = None
    due_date: Optional[datetime] = None
    progress: int = 0  # 0-100 percentage
    notes: Optional[str] = None

    class Settings:
        name = "child_tasks"
