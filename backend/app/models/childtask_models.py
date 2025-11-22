from beanie import Document, Link
from datetime import datetime
from typing import Optional, Union
from pydantic import BaseModel
from app.models.child_models import Child
from app.models.task_models import Task, TaskCategory, TaskType
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

# Embedded task data for custom tasks (not in library)
class TaskData(BaseModel):
    title: str
    description: str
    category: TaskCategory
    type: TaskType
    difficulty: int
    suggested_age_range: str
    reward_coins: int = 50
    reward_badge_name: Optional[str] = None

class ChildTask(Document):
    child: Link[Child]
    # Support both library tasks (Link) and custom tasks (embedded)
    task: Optional[Link[Task]] = None
    task_data: Optional[TaskData] = None  # For custom tasks not in library
    status: ChildTaskStatus = ChildTaskStatus.ASSIGNED
    assigned_at: datetime = datetime.utcnow()
    completed_at: Optional[datetime] = None
    
    # New fields for enhanced task management
    priority: Optional[ChildTaskPriority] = None
    due_date: Optional[datetime] = None
    progress: int = 0  # 0-100 percentage
    notes: Optional[str] = None
    
    # Override fields - allow customization per assignment without affecting template
    custom_title: Optional[str] = None  # If set, use this instead of task.title
    custom_reward_coins: Optional[int] = None  # If set, use this instead of task.reward_coins

    class Settings:
        name = "child_tasks"
