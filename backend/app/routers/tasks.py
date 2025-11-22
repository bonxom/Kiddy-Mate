from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.models.task_models import Task, TaskCategory, TaskType
from app.models.child_models import Child
from app.models.childtask_models import ChildTask, ChildTaskStatus, ChildTaskPriority, TaskData
from app.schemas.schemas import TaskPublic, TaskCreate, ChildTaskPublic, ChildTaskWithDetails
from typing import List, Optional
from datetime import datetime, time
from app.dependencies import verify_child_ownership
from app.models.reward_models import ChildReward, Reward
from app.services.auth import get_current_user
from app.models.user_models import User
from pydantic import ValidationError, BaseModel

router = APIRouter()

# Helper function to parse date string (YYYY-MM-DD) to datetime
def parse_date_string(date_str: Optional[str]) -> Optional[datetime]:
    """Parse date string in YYYY-MM-DD format to datetime at midnight UTC."""
    if not date_str:
        return None
    try:
        # Parse date and set time to midnight UTC to avoid timezone issues
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        return datetime.combine(date_obj.date(), time.min)
    except ValueError:
        return None

def merge_task_details(child_task: ChildTask, task_source) -> dict:
    """
    Merge ChildTask custom fields with Task template fields.
    Custom fields take precedence over template fields.
    Supports both Task document and embedded TaskData.
    """
    return {
        "title": child_task.custom_title if child_task.custom_title else task_source.title,
        "reward_coins": child_task.custom_reward_coins if child_task.custom_reward_coins is not None else task_source.reward_coins,
        # Other fields always from template/embedded
        "description": task_source.description,
        "category": task_source.category,
        "type": task_source.type,
        "difficulty": task_source.difficulty,
        "suggested_age_range": task_source.suggested_age_range,
        "reward_badge_name": task_source.reward_badge_name,
    }

# Request schema for update operations
class ChildTaskUpdateRequest(BaseModel):
    priority: Optional[ChildTaskPriority] = None
    due_date: Optional[str] = None  # Accept date string in YYYY-MM-DD format
    progress: Optional[int] = None
    notes: Optional[str] = None
    # Allow updating custom overrides
    custom_title: Optional[str] = None
    custom_reward_coins: Optional[int] = None

# Request schema for assigning tasks
class AssignTaskRequest(BaseModel):
    due_date: Optional[str] = None  # Accept date string in YYYY-MM-DD format
    priority: Optional[ChildTaskPriority] = None
    notes: Optional[str] = None

# Request schema for creating and assigning task in one step
class CreateAndAssignTaskRequest(BaseModel):
    title: str
    description: Optional[str] = None
    category: TaskCategory
    type: TaskType
    difficulty: int
    suggested_age_range: str
    reward_coins: int
    reward_badge_name: Optional[str] = None
    # Assignment params
    due_date: Optional[str] = None  # Accept date string in YYYY-MM-DD format
    priority: Optional[ChildTaskPriority] = None
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
        # Get task details (either from Link or embedded)
        if ct.task:
            task_source = await ct.task.fetch()
            task_id = str(ct.task.ref.id) if ct.task.ref else str(ct.task.id)
        elif ct.task_data:
            task_source = ct.task_data
            task_id = f"custom-{ct.id}"  # Custom tasks don't have separate Task ID
        else:
            continue
        
        if not task_source:
            continue
        
        # Apply category filter if specified
        if category and task_source.category != category:
            continue
        
        # Merge custom fields with task template/embedded data
        merged_details = merge_task_details(ct, task_source)
        
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
                custom_title=ct.custom_title,
                custom_reward_coins=ct.custom_reward_coins,
                task=TaskPublic(
                    id=task_id,
                    title=merged_details["title"],
                    description=merged_details["description"],
                    category=merged_details["category"],
                    type=merged_details["type"],
                    difficulty=merged_details["difficulty"],
                    suggested_age_range=merged_details["suggested_age_range"],
                    reward_coins=merged_details["reward_coins"],
                    reward_badge_name=merged_details["reward_badge_name"],
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
    request: AssignTaskRequest = AssignTaskRequest(),
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
        status=ChildTaskStatus.ASSIGNED,
        assigned_at=datetime.utcnow(),
        due_date=parse_date_string(request.due_date),
        priority=request.priority,
        notes=request.notes
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

    if child_task.status != ChildTaskStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task must be in progress to complete."
        )

    child_task.status = ChildTaskStatus.NEED_VERIFY
    child_task.progress = 100
    await child_task.save()
    
    return {"message": "Nhiệm vụ đã hoàn thành! Đang chờ phụ huynh xác nhận."}

@router.post("/{child_id}/tasks/{child_task_id}/verify", response_model=dict)
async def verify_task(
    child_id: str,
    child_task_id: str,
    child: Child = Depends(verify_child_ownership)
):
    """Verify/Approve a completed task - parent confirms child's work and awards rewards."""
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

    if child_task.status != ChildTaskStatus.NEED_VERIFY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task must be waiting for verification."
        )

    # Mark as completed
    child_task.status = ChildTaskStatus.COMPLETED
    child_task.completed_at = datetime.utcnow()

    # Award coins and badges - handle both Link and embedded task_data
    if child_task.task:
        # Task from library
        task_link = child_task.task
        task_id_or_ref = getattr(task_link, "id", None) or getattr(task_link, "ref", None)
        task_id_str = str(getattr(task_id_or_ref, "id", task_id_or_ref)) if task_id_or_ref is not None else None
        if not task_id_str:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found."
            )
        task_source = await Task.get(task_id_str)
        if not task_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found."
            )
    elif child_task.task_data:
        # Custom embedded task
        task_source = child_task.task_data
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task data not found."
        )

    # Use custom_reward_coins if set, otherwise use task's reward_coins
    reward_coins = child_task.custom_reward_coins if child_task.custom_reward_coins is not None else task_source.reward_coins
    child.current_coins += reward_coins

    if task_source.reward_badge_name:
        reward = await Reward.find_one(Reward.name == task_source.reward_badge_name)
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

    return {"message": "Xác nhận nhiệm vụ thành công! Đã trao thưởng."}

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
        child_task.due_date = parse_date_string(task_update.due_date)
    if task_update.progress is not None:
        child_task.progress = task_update.progress
    if task_update.notes is not None:
        child_task.notes = task_update.notes
    if task_update.custom_title is not None:
        child_task.custom_title = task_update.custom_title
    if task_update.custom_reward_coins is not None:
        child_task.custom_reward_coins = task_update.custom_reward_coins
    
    await child_task.save()
    
    # Fetch task details for response (handle both Link and embedded)
    if child_task.task:
        task_source = await child_task.task.fetch()
        task_id = str(child_task.task.ref.id) if child_task.task.ref else str(child_task.task.id)
    elif child_task.task_data:
        task_source = child_task.task_data
        task_id = f"custom-{child_task.id}"
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task data not found."
        )
    
    # Merge custom fields with task template/embedded data
    merged_details = merge_task_details(child_task, task_source)
    
    return ChildTaskWithDetails(
        id=str(child_task.id),
        status=child_task.status,
        assigned_at=child_task.assigned_at,
        completed_at=child_task.completed_at,
        priority=child_task.priority.value if child_task.priority else None,
        due_date=child_task.due_date,
        progress=child_task.progress,
        notes=child_task.notes,
        custom_title=child_task.custom_title,
        custom_reward_coins=child_task.custom_reward_coins,
        task=TaskPublic(
            id=task_id,
            title=merged_details["title"],
            description=merged_details["description"],
            category=merged_details["category"],
            type=merged_details["type"],
            difficulty=merged_details["difficulty"],
            suggested_age_range=merged_details["suggested_age_range"],
            reward_coins=merged_details["reward_coins"],
            reward_badge_name=merged_details["reward_badge_name"],
        )
    )

@router.post("/{child_id}/tasks/create-and-assign", response_model=ChildTaskWithDetails)
async def create_and_assign_task(
    child_id: str,
    request: CreateAndAssignTaskRequest,
    child: Child = Depends(verify_child_ownership)
):
    """Create a custom task and assign it to child in one step. Does NOT add to task library."""
    # Create embedded task data (NOT inserted into Task collection)
    task_data = TaskData(
        title=request.title,
        description=request.description or '',
        category=request.category,
        type=request.type,
        difficulty=request.difficulty,
        suggested_age_range=request.suggested_age_range,
        reward_coins=request.reward_coins,
        reward_badge_name=request.reward_badge_name,
    )
    
    # Assign to child with embedded task data
    child_task = ChildTask(
        child=child,
        task=None,  # No link to Task collection
        task_data=task_data,  # Embedded data
        status=ChildTaskStatus.ASSIGNED,
        assigned_at=datetime.utcnow(),
        priority=request.priority or ChildTaskPriority.MEDIUM,
        due_date=parse_date_string(request.due_date),
        notes=request.notes,
    )
    await child_task.insert()
    
    # Return full details
    return ChildTaskWithDetails(
        id=str(child_task.id),
        status=child_task.status,
        assigned_at=child_task.assigned_at,
        completed_at=child_task.completed_at,
        priority=child_task.priority.value if child_task.priority else None,
        due_date=child_task.due_date,
        progress=child_task.progress,
        notes=child_task.notes,
        custom_title=child_task.custom_title,
        custom_reward_coins=child_task.custom_reward_coins,
        task=TaskPublic(
            id=f"custom-{child_task.id}",  # Custom tasks use ChildTask ID
            title=task_data.title,
            description=task_data.description,
            category=task_data.category,
            type=task_data.type,
            difficulty=task_data.difficulty,
            suggested_age_range=task_data.suggested_age_range,
            reward_coins=task_data.reward_coins,
            reward_badge_name=task_data.reward_badge_name,
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
