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
    Get comprehensive dashboard data for a child.
    Returns child info, task stats, rewards, and progress metrics.
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

    # Total stars = coins (in this system, stars = coins earned)
    total_stars = child.current_coins

    # Achievements = badges earned
    achievements = badges_earned

    return {
        "child": {
            "name": child.name,
            "level": child.level,
            "coins": child.current_coins
        },
        "tasks_completed": tasks_completed,
        "badges_earned": badges_earned,
        "total_stars": total_stars,
        "achievements": achievements,
        "completion_rate": completion_rate
    }
