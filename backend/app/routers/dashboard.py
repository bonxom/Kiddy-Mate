from fastapi import APIRouter, Depends
from beanie import Link
from app.models.child_models import Child
from app.models.childtask_models import ChildTask, ChildTaskStatus
from app.models.reward_models import ChildReward
from app.models.task_models import Task
from app.dependencies import verify_child_ownership, get_child_tasks_by_child, fetch_link_or_get_object
from typing import Dict, List
from pydantic import BaseModel
from beanie import Link

router = APIRouter()

class CategoryProgressItem(BaseModel):
    name: str
    completed: int
    total: int
    percentage: int

@router.get("/{child_id}", response_model=Dict)
async def get_dashboard(
    child: Child = Depends(verify_child_ownership)
):
    """
    Get comprehensive dashboard statistics for a child.
    
    Returns:
        - Child basic info (name, level, coins)
        - Task completion metrics (completed, total, rate)
        - Badge/reward count
        
    All counts are calculated in real-time from database.
    Frontend should use child.coins directly.
    """
    child_id_str = str(child.id)
    
    # Count completed tasks
    all_tasks = await ChildTask.find_all().to_list()
    tasks_for_child = [
        t for t in all_tasks 
        if extract_id_from_link(t.child) == child_id_str
    ]
    tasks_completed = sum(
        1 for t in tasks_for_child 
        if t.status == ChildTaskStatus.COMPLETED
    )

    # Count badges earned
    all_rewards = await ChildReward.find_all().to_list()
    badges_earned = sum(
        1 for r in all_rewards 
        if extract_id_from_link(r.child) == child_id_str
    )

    # Total tasks
    total_tasks = len(tasks_for_child)

    # Calculate completion rate
    completion_rate = round((tasks_completed / total_tasks * 100), 1) if total_tasks > 0 else 0

    return {
        "child": {
            "name": child.name,
            "level": child.level,
            "coins": child.current_coins
        },
        "tasks_completed": tasks_completed,
        "badges_earned": badges_earned,
        "completion_rate": completion_rate
    }

@router.get("/{child_id}/category-progress", response_model=List[CategoryProgressItem])
async def get_category_progress(
    child: Child = Depends(verify_child_ownership)
):
    """
    Get task progress grouped by category for a child.
    
    Returns a list of categories with:
    - name: Category name (Creativity, Social, Academic, etc.)
    - completed: Number of completed tasks in this category
    - total: Total number of tasks in this category
    - percentage: Completion percentage (0-100)
    
    Categories are normalized: IQ -> Logic, EQ -> Social
    """
    # Get all child tasks
    child_tasks = await get_child_tasks_by_child(child)
    
    # Initialize category map with all standard categories
    categories = ['Independence', 'Logic', 'Physical', 'Creativity', 'Social', 'Academic']
    category_map: Dict[str, Dict[str, int]] = {}
    
    for cat in categories:
        category_map[cat] = {'completed': 0, 'total': 0}
    
    # Process tasks and normalize category names
    for ct in child_tasks:
        if not ct.task:
            continue
            
        # Fetch task if it's a Link reference
        task = await fetch_link_or_get_object(ct.task, Task)
        
        # If still a Link, try to fetch it directly
        if isinstance(ct.task, Link) and (not task or not isinstance(task, Task)):
            try:
                task = await ct.task.fetch()
            except Exception:
                continue
        
        # Ensure task is actually a Task instance
        if not task or not isinstance(task, Task):
            continue
            
        if not hasattr(task, 'category') or not task.category:
            continue
        
        # Normalize legacy categories (IQ -> Logic, EQ -> Social)
        category = task.category
        if category == 'IQ':
            category = 'Logic'
        elif category == 'EQ':
            category = 'Social'
        
        # Only process known categories
        if category in category_map:
            category_map[category]['total'] += 1
            if ct.status == ChildTaskStatus.COMPLETED:
                category_map[category]['completed'] += 1
    
    # Build response with percentages
    result = []
    for cat_name, data in category_map.items():
        total = data['total']
        completed = data['completed']
        percentage = round((completed / total * 100)) if total > 0 else 0
        
        result.append(CategoryProgressItem(
            name=cat_name,
            completed=completed,
            total=total,
            percentage=percentage
        ))
    
    return result
