"""
Task Library Router
Handles task library management (CRUD for tasks in the global library)
These endpoints don't require a child_id context
"""

from fastapi import APIRouter, HTTPException, status, Depends
from app.models.task_models import Task, TaskCategory, TaskType, UnityType
from app.schemas.schemas import TaskPublic, TaskCreate
from typing import List, Optional
from app.services.auth import get_current_user
from app.models.user_models import User
from pydantic import BaseModel

router = APIRouter()


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[TaskCategory] = None
    type: Optional[TaskType] = None
    difficulty: Optional[int] = None
    suggested_age_range: Optional[str] = None
    reward_coins: Optional[int] = None
    reward_badge_name: Optional[str] = None
    unity_type: Optional[UnityType] = None

@router.get("/tasks", response_model=List[TaskPublic])
async def list_all_tasks() -> List[TaskPublic]:
    """Get all tasks from the library."""
    tasks = await Task.find_all().to_list()
    return [
        TaskPublic(
            id=str(t.id),
            title=t.title,
            description=t.description,
            category=t.category,
            type=t.type,
            difficulty=t.difficulty,
            suggested_age_range=t.suggested_age_range,
            reward_coins=t.reward_coins,
            reward_badge_name=t.reward_badge_name,
            unity_type=t.unity_type.value if t.unity_type else None,
        )
        for t in tasks
    ]

@router.post("/tasks", response_model=TaskPublic)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a custom task (parent can create tasks for their children)."""
    unity_type_value = None
    if task.unity_type:
        unity_type_value = UnityType(task.unity_type)
    
    new_task = Task(
        title=task.title,
        description=task.description,
        category=task.category,
        type=task.type,
        difficulty=task.difficulty,
        suggested_age_range=task.suggested_age_range,
        reward_coins=task.reward_coins if hasattr(task, 'reward_coins') else 50,
        reward_badge_name=task.reward_badge_name if hasattr(task, 'reward_badge_name') else None,
        unity_type=unity_type_value,
    )
    await new_task.insert()
    
    return TaskPublic(
        id=str(new_task.id),
        title=new_task.title,
        description=new_task.description,
        category=new_task.category,
        type=new_task.type,
        difficulty=new_task.difficulty,
        suggested_age_range=new_task.suggested_age_range,
        reward_coins=new_task.reward_coins,
        reward_badge_name=new_task.reward_badge_name,
        unity_type=new_task.unity_type.value if new_task.unity_type else None,
    )

@router.put("/tasks/{task_id}", response_model=TaskPublic)
async def update_task(
    task_id: str,
    task_update: TaskUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """Update an existing task in the library."""
    task = await Task.get(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found."
        )
    
    
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.category is not None:
        task.category = task_update.category
    if task_update.type is not None:
        task.type = task_update.type
    if task_update.difficulty is not None:
        task.difficulty = task_update.difficulty
    if task_update.suggested_age_range is not None:
        task.suggested_age_range = task_update.suggested_age_range
    if task_update.reward_coins is not None:
        task.reward_coins = task_update.reward_coins
    if task_update.reward_badge_name is not None:
        task.reward_badge_name = task_update.reward_badge_name
    if task_update.unity_type is not None:
        task.unity_type = task_update.unity_type
    
    await task.save()
    
    return TaskPublic(
        id=str(task.id),
        title=task.title,
        description=task.description,
        category=task.category,
        type=task.type,
        difficulty=task.difficulty,
        suggested_age_range=task.suggested_age_range,
        reward_coins=task.reward_coins,
        reward_badge_name=task.reward_badge_name,
        unity_type=task.unity_type.value if task.unity_type else None,
    )

@router.delete("/tasks/{task_id}", response_model=dict)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a task from the library. Also removes it from any child's assigned tasks."""
    from app.models.childtask_models import ChildTask
    
    task = await Task.get(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found."
        )
    
    
    await ChildTask.find(ChildTask.task.id == task_id).delete()  
    
    
    await task.delete()
    
    return {"message": f"Task {task_id} deleted successfully."}
