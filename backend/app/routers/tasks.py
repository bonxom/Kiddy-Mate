from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.models.task_models import Task, TaskCategory, TaskType
from app.models.child_models import Child
from app.models.childtask_models import ChildTask, ChildTaskStatus, ChildTaskPriority
from app.schemas.schemas import TaskPublic, TaskCreate, ChildTaskPublic, ChildTaskWithDetails
from typing import List, Optional
from datetime import datetime
from app.dependencies import verify_child_ownership, verify_parent_token, verify_child_token, get_child_from_token, get_child_tasks_by_child, extract_id_from_link, fetch_link_or_get_object, ensure_link_references_for_save
from app.models.reward_models import ChildReward, Reward
from app.services.auth import get_current_user
from app.models.user_models import User
from pydantic import ValidationError, BaseModel

router = APIRouter()

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
    existing_task_ids = await get_child_tasks_by_child(child)
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
            unity_type=t.unity_type.value if t.unity_type else None,
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
    all_child_tasks = await get_child_tasks_by_child(child)
    
    if status_filter:
        child_tasks = [ct for ct in all_child_tasks if ct.status == status_filter]
    else:
        child_tasks = all_child_tasks
    
    child_tasks = sorted(child_tasks, key=lambda x: x.assigned_at, reverse=True)
    
    results = []
    for ct in child_tasks:
        task = await fetch_link_or_get_object(ct.task, Task) if ct.task else None
        if not task:
            continue
        
        if category and task.category != category:
            continue
        
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
                unity_type=ct.unity_type.value if ct.unity_type else None,
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
                    unity_type=task.unity_type.value if task.unity_type else None,
                )
            )
        )
    
    
    if limit:
        results = results[:limit]
    
    return results

@router.post("/{child_id}/tasks/{task_id}/start", response_model=ChildTaskPublic)
async def start_task(
    child_id: str,
    task_id: str,
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_child_token)
):
    """
    Start a task (CHILD ONLY).
    Child can start working on an assigned task.
    """
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

    all_child_tasks = await get_child_tasks_by_child(child)
    existing = None
    for ct in all_child_tasks:
        task_ref_id = extract_id_from_link(ct.task)
        if task_ref_id == task_id:
            existing = ct
            break
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task already assigned to this child."
        )

    new_child_task = ChildTask(
        child=child,
        task=task,
        status=ChildTaskStatus.ASSIGNED,
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
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_child_token)
):
    """
    Complete a task (CHILD ONLY).
    Child marks task as completed, waiting for parent verification.
    """
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

    current_status = child_task.status
    status_value = current_status.value if hasattr(current_status, 'value') else str(current_status)
    
    if isinstance(current_status, str):
        try:
            current_status = ChildTaskStatus(current_status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid task status: {current_status}"
            )
    
    if current_status == ChildTaskStatus.NEED_VERIFY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task has already been completed and is waiting for parent verification. Cannot complete again."
        )
    
    if current_status == ChildTaskStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task has already been completed and verified. Cannot complete again."
        )
    
    if current_status == ChildTaskStatus.GIVEUP:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task has been given up. Cannot complete a task that has been given up."
        )
    
    if current_status == ChildTaskStatus.MISSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task has been missed. Cannot complete a task that has been missed."
        )
    
    if current_status not in [ChildTaskStatus.ASSIGNED, ChildTaskStatus.IN_PROGRESS]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete task with status '{status_value}'. Task must be in 'assigned' or 'in_progress' status."
        )
    
    if current_status == ChildTaskStatus.ASSIGNED:
        await child_task.set({"status": ChildTaskStatus.IN_PROGRESS})

    await child_task.set({
        "status": ChildTaskStatus.NEED_VERIFY,
        "progress": 100,
        "completed_at": datetime.utcnow()
    })
    
    return {"message": "Task completed successfully! Waiting for parent verification."}

@router.post("/{child_id}/tasks/{child_task_id}/verify", response_model=dict)
async def verify_task(
    child_id: str,
    child_task_id: str,
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_parent_token)
):
    """Verify/Approve a completed task - parent confirms child's work and awards rewards.
    PARENT ONLY: Only parents can verify and approve tasks."""
    try:
        child_task = await ChildTask.get(child_task_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid child task ID format: {child_task_id}"
        )
    
    if not child_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Child task not found with ID: {child_task_id}"
        )

    
    link_child_id = extract_id_from_link(child_task.child)
    if not link_child_id or link_child_id in ('None', 'null', '') or link_child_id != str(child.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You do not own this task. Child task belongs to child ID: {link_child_id}, but you requested child ID: {str(child.id)}"
        )

    if child_task.status != ChildTaskStatus.NEED_VERIFY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task must be waiting for verification."
        )

    child_task.status = ChildTaskStatus.COMPLETED
    child_task.completed_at = datetime.utcnow()

    task_goc = await fetch_link_or_get_object(child_task.task, Task)
    if not task_goc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task reference not found in child task."
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

    await child_task.set({
        "status": ChildTaskStatus.COMPLETED,
        "completed_at": datetime.utcnow()
    })
    await child.save()
    
    return {"message": "Task verified successfully! Rewards have been awarded."}

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
    
    if task_update.priority is not None:
        child_task.priority = task_update.priority
    if task_update.due_date is not None:
        child_task.due_date = task_update.due_date
    if task_update.progress is not None:
        child_task.progress = task_update.progress
    if task_update.notes is not None:
        child_task.notes = task_update.notes
    
    update_data = {}
    if task_update.priority is not None:
        update_data["priority"] = task_update.priority
    if task_update.due_date is not None:
        update_data["due_date"] = task_update.due_date
    if task_update.progress is not None:
        update_data["progress"] = task_update.progress
    if task_update.notes is not None:
        update_data["notes"] = task_update.notes
    
    if update_data:
        await child_task.set(update_data)
        child_task = await ChildTask.get(child_task_id)
    
    task = await fetch_link_or_get_object(child_task.task, Task) if child_task.task else None
    
    return ChildTaskWithDetails(
        id=str(child_task.id),
        status=child_task.status,
        assigned_at=child_task.assigned_at,
        completed_at=child_task.completed_at,
        priority=child_task.priority.value if child_task.priority else None,
        due_date=child_task.due_date,
        progress=child_task.progress,
        notes=child_task.notes,
        unity_type=child_task.unity_type.value if child_task.unity_type else None,
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

@router.get("/{child_id}/tasks/{task_id}/status", response_model=dict)
async def check_task_status(
    child_id: str,
    task_id: str,
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_child_token)
):
    """
    Check task status (CHILD ONLY).
    Returns the current status of a task for the child.
    """
    all_child_tasks = await get_child_tasks_by_child(child)
    child_task = None
    for ct in all_child_tasks:
        task_ref_id = extract_id_from_link(ct.task)
        if task_ref_id == task_id:
            child_task = ct
            break
    
    if not child_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found for this child."
        )
    
    return {"status": child_task.status.value}

@router.post("/{child_id}/tasks/{task_id}/giveup", response_model=dict)
async def giveup_task(
    child_id: str,
    task_id: str,
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_child_token)
):
    """
    Give up on a task (CHILD ONLY).
    Changes task status from 'in_progress' to 'giveup'.
    Accepts both task_id (Task library ID) or child_task_id (ChildTask ID).
    """
    child_task = None
    try:
        child_task = await ChildTask.get(task_id)
        if child_task:
            link_child_id = extract_id_from_link(child_task.child)
            if link_child_id != str(child.id):
                child_task = None
    except Exception:
        child_task = None
    
    if not child_task:
        try:
            task = await Task.get(task_id)
        except Exception:
            task = None
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task or ChildTask with ID '{task_id}' not found. Please check the ID and ensure the task is assigned to this child."
            )
        
        all_child_tasks = await get_child_tasks_by_child(child)
        for ct in all_child_tasks:
            task_ref_id = extract_id_from_link(ct.task)
            if task_ref_id == task_id:
                child_task = ct
                break
        
        if not child_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task '{task_id}' is not assigned to this child. Please assign the task first using POST /children/{child_id}/tasks/{task_id}/start"
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
    
    if child_task.status not in [ChildTaskStatus.ASSIGNED, ChildTaskStatus.IN_PROGRESS]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot give up task with status '{child_task.status.value}'. Task must be assigned or in progress."
        )
    
    if child_task.status == ChildTaskStatus.ASSIGNED:
        await child_task.set({"status": ChildTaskStatus.IN_PROGRESS})
    
    await child_task.set({"status": ChildTaskStatus.GIVEUP})
    
    return {"message": "Task marked as given up successfully.", "status": ChildTaskStatus.GIVEUP.value}

@router.post("/{child_id}/tasks/unassigned", response_model=List[ChildTaskWithDetails])
async def get_unassigned_tasks(
    child_id: str,
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_child_token),
    category: Optional[str] = Query(None, description="Filter by task category")
):
    """
    Get unassigned tasks for a child (CHILD ONLY).
    Returns tasks with status 'unassigned' that are ready to be assigned.
    """
    all_child_tasks = await get_child_tasks_by_child(child)
    child_tasks = [ct for ct in all_child_tasks if ct.status == ChildTaskStatus.UNASSIGNED]
    child_tasks = sorted(child_tasks, key=lambda x: x.assigned_at, reverse=True)
    
    results = []
    for ct in child_tasks:
        task = await fetch_link_or_get_object(ct.task, Task) if ct.task else None
        if not task:
            continue
        
        if category and task.category != category:
            continue
        
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
                unity_type=ct.unity_type.value if ct.unity_type else None,
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
                    unity_type=task.unity_type.value if task.unity_type else None,
                )
            )
        )
    
    return results

@router.post("/{child_id}/tasks/giveup", response_model=List[ChildTaskWithDetails])
async def get_giveup_tasks(
    child_id: str,
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_parent_token)
):
    """
    Get tasks that child has given up on (Parent endpoint).
    Returns all tasks with status 'giveup' for the child.
    """
    all_child_tasks = await get_child_tasks_by_child(child)
    child_tasks = [ct for ct in all_child_tasks if ct.status == ChildTaskStatus.GIVEUP]
    child_tasks = sorted(child_tasks, key=lambda x: x.assigned_at, reverse=True)
    
    results = []
    for ct in child_tasks:
        task = await fetch_link_or_get_object(ct.task, Task) if ct.task else None
        if not task:
            continue
        
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
                unity_type=ct.unity_type.value if ct.unity_type else None,
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
                    unity_type=task.unity_type.value if task.unity_type else None,
                )
            )
        )
    
    return results

@router.get("/{child_id}/tasks/completed", response_model=List[ChildTaskWithDetails])
async def get_completed_tasks(
    child_id: str,
    child: Child = Depends(verify_child_ownership),
    current_user: User = Depends(verify_child_token),
    limit: Optional[int] = Query(None, description="Limit number of results"),
    category: Optional[str] = Query(None, description="Filter by task category")
):
    """
    Get completed tasks for a child (CHILD ONLY).
    Returns tasks with status 'completed' (verified by parent).
    """
    all_child_tasks = await get_child_tasks_by_child(child)
    child_tasks = [ct for ct in all_child_tasks if ct.status == ChildTaskStatus.COMPLETED]
    child_tasks = sorted(child_tasks, key=lambda x: x.completed_at or x.assigned_at, reverse=True)
    
    results = []
    for ct in child_tasks:
        task = await fetch_link_or_get_object(ct.task, Task) if ct.task else None
        if not task:
            continue
        
        if category and task.category != category:
            continue
        
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
                unity_type=ct.unity_type.value if ct.unity_type else None,
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
                    unity_type=task.unity_type.value if task.unity_type else None,
                )
            )
        )
    
    
    if limit:
        results = results[:limit]
    
    return results
