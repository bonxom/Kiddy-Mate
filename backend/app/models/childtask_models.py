from beanie import Document, Link
from datetime import datetime
from typing import Optional
from app.models.child_models import Child
from app.models.task_models import Task
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

class ChildTask(Document):
    child: Link[Child]
    task: Link[Task]
    status: ChildTaskStatus = ChildTaskStatus.ASSIGNED
    assigned_at: datetime = datetime.utcnow()
    completed_at: Optional[datetime] = None
    
    
    priority: Optional[ChildTaskPriority] = None
    due_date: Optional[datetime] = None
    progress: int = 0  
    notes: Optional[str] = None
    unity_type: Optional[UnityType] = None  

    class Settings:
        name = "child_tasks"
