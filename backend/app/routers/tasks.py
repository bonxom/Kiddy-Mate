from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.models.task_models import Task, TaskCategory, TaskType
from app.models.child_models import Child
from app.models.childtask_models import ChildTask, ChildTaskStatus, ChildTaskPriority
from app.schemas.schemas import TaskPublic, TaskCreate, ChildTaskPublic, ChildTaskWithDetails
from typing import List, Optional
from datetime import datetime
from app.dependencies import verify_child_ownership
from app.models.reward_models import ChildReward, Reward
from app.services.auth import get_current_user
from app.models.user_models import User
from pydantic import ValidationError, BaseModel

router = APIRouter()

# Request schema for update operations
class ChildTaskUpdateRequest(BaseModel):
    priority: Optional[ChildTaskPriority] = None
    due_date: Optional[datetime] = None
    progress: Optional[int] = None
    notes: Optional[str] = None


@router.get("/{child_id}/tasks/suggested", response_model=List[TaskPublic])
async def get_suggested_tasks(
    child_id: str,
    child: Child = Depends(verify_child_ownership)
):
    existing_task_ids = await ChildTask.find(ChildTask.child.id == child.id).to_list()
    existing_ids: list[str] = []
    for ct in existing_task_ids:
        task_ref = getattr(ct.task, "id", None) or getattr(ct.task, "ref", None)
        if task_ref is not None:
            existing_ids.append(str(getattr(task_ref, "id", task_ref)))

    suggested_tasks = await Task.find_all().limit(10).to_list()
    suggested_tasks = [t for t in suggested_tasks if str(t.id) not in existing_ids]
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
        )
        for t in suggested_tasks[:5]
    ]

@router.get("/{child_id}/tasks", response_model=List[ChildTaskWithDetails])
async def get_child_tasks(
    child_id: str,
    child: Child = Depends(verify_child_ownership),
    limit: Optional[int] = Query(None, description="Limit number of results"),
    category: Optional[str] = Query(None, description="Filter by task category"),
    status_filter: Optional[ChildTaskStatus] = Query(None, alias="status", description="Filter by task status")
):
    """
    Get child's assigned tasks with full task details populated.
    Supports filtering by category and status, and limiting results.
    """
    query = ChildTask.find(ChildTask.child.id == child.id)
    
    # Apply status filter if provided
    if status_filter:
        query = query.find(ChildTask.status == status_filter)
    
    # Sort by assigned_at descending (most recent first)
    query = query.sort("-assigned_at")
    
    # Get child tasks
    child_tasks = await query.to_list()
    
    # Populate task details and apply category filter
    results = []
    for ct in child_tasks:
        # Fetch task details
        task = await ct.task.fetch() if ct.task else None
        if not task:
            continue
        
        # Apply category filter if specified
        if category and task.category != category:
            continue
        
        # Build response with full task details
        results.append(
            ChildTaskWithDetails(
                id=str(ct.id),
                status=ct.status,
                assigned_at=ct.assigned_at,
                completed_at=ct.completed_at,
                priority=ct.priority.value if ct.priority else None,
                due_date=ct.due_date,
                progress=ct.progress,
                notes=ct.notes,
                task=TaskPublic(
                    id=str(task.id),
                    title=task.title,
                    description=task.description,
                    category=task.category,
                    type=task.type,
                    difficulty=task.difficulty,
                    suggested_age_range=task.suggested_age_range,
                    reward_coins=task.reward_coins,
                    reward_badge_name=task.reward_badge_name,
                )
            )
        )
    
    # Apply limit if specified
    if limit:
        results = results[:limit]
    
    return results

@router.post("/{child_id}/tasks/{task_id}/start", response_model=ChildTaskPublic)
async def start_task(
    child_id: str,
    task_id: str,
    child: Child = Depends(verify_child_ownership)
):
    try:
        task = await Task.get(task_id)
    except ValidationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task id format."
        )
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found. Use /children/{child_id}/tasks/suggested or /tasks to get a valid task id."
        )

    existing = await ChildTask.find_one(
        ChildTask.child.id == child.id,
        ChildTask.task.id == task_id
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task already assigned to this child."
        )
    
    new_child_task = ChildTask(
        child=child,
        task=task,
        status=ChildTaskStatus.IN_PROGRESS,
        assigned_at=datetime.utcnow()
    )
    await new_child_task.insert()
    return ChildTaskPublic(
        id=str(new_child_task.id),
        status=new_child_task.status,
        assigned_at=new_child_task.assigned_at,
        completed_at=new_child_task.completed_at,
    )

@router.post("/{child_id}/tasks/{child_task_id}/complete", response_model=dict)
async def complete_task(
    child_id: str,
    child_task_id: str,
    child: Child = Depends(verify_child_ownership)
):
    child_task = await ChildTask.get(child_task_id)
    if not child_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child task not found."
        )

    link_child_id = None
    if getattr(child_task.child, "id", None) is not None:
        link_child_id = str(child_task.child.id)
    elif getattr(child_task.child, "ref", None) is not None:
        ref_obj = child_task.child.ref
        link_child_id = str(getattr(ref_obj, "id", ref_obj))
    if link_child_id != str(child.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this task."
        )
    
    child_task.status = ChildTaskStatus.COMPLETED
    child_task.completed_at = datetime.utcnow()
    await child_task.save()
    return {"message": "Đánh dấu hoàn thành thành công."}

@router.post("/{child_id}/tasks/{child_task_id}/verify", response_model=dict)
async def verify_task(
    child_id: str,
    child_task_id: str,
    child: Child = Depends(verify_child_ownership)
):
    child_task = await ChildTask.get(child_task_id)
    if not child_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child task not found."
        )

    link_child_id = None
    if getattr(child_task.child, "id", None) is not None:
        link_child_id = str(child_task.child.id)
    elif getattr(child_task.child, "ref", None) is not None:
        ref_obj = child_task.child.ref
        link_child_id = str(getattr(ref_obj, "id", ref_obj))
    if link_child_id != str(child.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this task."
        )

    child_task.status = ChildTaskStatus.VERIFIED

    task_link = child_task.task
    task_id_or_ref = getattr(task_link, "id", None) or getattr(task_link, "ref", None)
    task_id_str = str(getattr(task_id_or_ref, "id", task_id_or_ref)) if task_id_or_ref is not None else None
    if not task_id_str:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found."
        )
    task_goc = await Task.get(task_id_str)
    task_goc = await Task.get(task_id_str)
    task_goc = await Task.get(task_id_str)
    if not task_goc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found."
        )

    child.current_coins += task_goc.reward_coins

    if task_goc.reward_badge_name:
        reward = await Reward.find_one(Reward.name == task_goc.reward_badge_name)
        if reward:
            existing_reward = await ChildReward.find_one(
                ChildReward.child.id == child.id,
                ChildReward.reward.id == reward.id
            )
            if not existing_reward:
                new_reward = ChildReward(
                    child=child,
                    reward=reward
                )
                await new_reward.insert()

    await child_task.save()
    await child.save()

    return {"message": "Xác nhận nhiệm vụ thành công."}

@router.put("/{child_id}/tasks/{child_task_id}", response_model=ChildTaskWithDetails)
async def update_assigned_task(
    child_id: str,
    child_task_id: str,
    task_update: ChildTaskUpdateRequest,
    child: Child = Depends(verify_child_ownership)
):
    """Update an assigned task's priority, due_date, progress, or notes."""
    child_task = await ChildTask.get(child_task_id)
    if not child_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child task not found."
        )
    
    # Verify ownership
    link_child_id = None
    if getattr(child_task.child, "id", None) is not None:
        link_child_id = str(child_task.child.id)
    elif getattr(child_task.child, "ref", None) is not None:
        ref_obj = child_task.child.ref
        link_child_id = str(getattr(ref_obj, "id", ref_obj))
    if link_child_id != str(child.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this task."
        )
    
    # Update fields if provided
    if task_update.priority is not None:
        child_task.priority = task_update.priority
    if task_update.due_date is not None:
        child_task.due_date = task_update.due_date
    if task_update.progress is not None:
        child_task.progress = task_update.progress
    if task_update.notes is not None:
        child_task.notes = task_update.notes
    
    await child_task.save()
    
    # Fetch task details for response
    task = await child_task.task.fetch()
    
    return ChildTaskWithDetails(
        id=str(child_task.id),
        status=child_task.status,
        assigned_at=child_task.assigned_at,
        completed_at=child_task.completed_at,
        priority=child_task.priority.value if child_task.priority else None,
        due_date=child_task.due_date,
        progress=child_task.progress,
        notes=child_task.notes,
        task=TaskPublic(
            id=str(task.id),
            title=task.title,
            description=task.description,
            category=task.category,
            type=task.type,
            difficulty=task.difficulty,
            suggested_age_range=task.suggested_age_range,
            reward_coins=task.reward_coins,
            reward_badge_name=task.reward_badge_name,
        )
    )

@router.delete("/{child_id}/tasks/{child_task_id}", response_model=dict)
async def delete_assigned_task(
    child_id: str,
    child_task_id: str,
    child: Child = Depends(verify_child_ownership)
):
    """Unassign (delete) a task from a child."""
    child_task = await ChildTask.get(child_task_id)
    if not child_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child task not found."
        )
    
    # Verify ownership
    link_child_id = None
    if getattr(child_task.child, "id", None) is not None:
        link_child_id = str(child_task.child.id)
    elif getattr(child_task.child, "ref", None) is not None:
        ref_obj = child_task.child.ref
        link_child_id = str(getattr(ref_obj, "id", ref_obj))
    if link_child_id != str(child.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this task."
        )
    
    await child_task.delete()
    
    return {"message": f"Task {child_task_id} unassigned successfully."}