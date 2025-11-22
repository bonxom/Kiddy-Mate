from beanie import Document, Link
from datetime import datetime
from typing import Optional, Union
from pydantic import BaseModel
from app.models.child_models import Child
from app.models.task_models import Task, TaskCategory, TaskType
import enum

class UnityType(str, enum.Enum):
    LIFE = "life"           
    CHOICE = "choice"       
    TALK = "talk"           

class ChildTaskStatus(str, enum.Enum):
    UNASSIGNED = "unassigned"       
    ASSIGNED = "assigned"           
    IN_PROGRESS = "in_progress"     
    NEED_VERIFY = "need_verify"     
    COMPLETED = "completed"         
    GIVEUP = "giveup"               
    MISSED = "missed"               

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
    
    
    priority: Optional[ChildTaskPriority] = None
    due_date: Optional[datetime] = None
    progress: int = 0  
    notes: Optional[str] = None

    # pat
    custom_title: Optional[str] = None  # If set, use this instead of task.title
    custom_reward_coins: Optional[int] = None  # If set, use this instead of task.reward_coins
    custom_category: Optional[TaskCategory] = None  # If set, use this instead of task.category
    
    # ldt
    unity_type: Optional[UnityType] = None  

    class Settings:
        name = "child_tasks"
