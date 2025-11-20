from fastapi import APIRouter, Depends
from app.models.child_models import Child
from app.models.childtask_models import ChildTask, ChildTaskStatus
from app.models.reward_models import ChildReward
from app.dependencies import verify_child_ownership
from typing import Dict

router = APIRouter()

@router.get("/dashboard/{child_id}", response_model=Dict)
async def get_dashboard(
    child: Child = Depends(verify_child_ownership)
):
    tasks_completed = await ChildTask.find(
        ChildTask.child.id == child.id,
        ChildTask.status == ChildTaskStatus.COMPLETED
    ).count()

    badges_earned = await ChildReward.find(
        ChildReward.child.id == child.id
    ).count()

    return {
        "child": {
            "name": child.name,
            "level": child.level,
            "coins": child.current_coins
        },
        "tasks_completed": tasks_completed,
        "badges_earned": badges_earned
    }
