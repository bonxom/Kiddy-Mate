from fastapi import APIRouter, Depends
from beanie import Link
from app.models.child_models import Child
from app.models.childtask_models import ChildTask, ChildTaskStatus
from app.models.reward_models import ChildReward
from app.dependencies import verify_child_ownership, extract_id_from_link
from typing import Dict

router = APIRouter()

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
