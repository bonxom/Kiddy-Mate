from fastapi import APIRouter, Depends
from app.models.child_models import Child
from app.models.childtask_models import ChildTask, ChildTaskStatus
from app.models.reward_models import ChildReward
from app.dependencies import verify_child_ownership
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
    # Count verified tasks (completed and approved by parent)
    tasks_completed = await ChildTask.find(
        ChildTask.child.id == child.id,
        ChildTask.status == ChildTaskStatus.COMPLETED
    ).count()

    # Count all badges/rewards earned
    badges_earned = await ChildReward.find(
        ChildReward.child.id == child.id
    ).count()

    # Count total assigned tasks
    total_tasks = await ChildTask.find(
        ChildTask.child.id == child.id
    ).count()

    # Calculate completion rate (verified / total assigned)
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
