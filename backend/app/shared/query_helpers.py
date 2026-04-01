from typing import Optional

from app.models.child_models import Child
from app.models.childtask_models import ChildTask
from app.models.user_models import User


async def get_user_children(user: User) -> list[Child]:
    """
    Get all children belonging to a user.
    Handles both Link references and nested object formats.
    """
    from beanie import Link

    try:
        children = await Child.find(Child.parent == Link(user, User)).to_list()
        if children:
            return children
    except Exception:
        pass

    all_children = await Child.find_all().to_list()
    user_children: list[Child] = []
    user_id_str = str(user.id)

    for child in all_children:
        parent_id = None

        if hasattr(child.parent, "id"):
            parent_id = str(child.parent.id)
        elif hasattr(child.parent, "ref"):
            ref_obj = child.parent.ref
            if hasattr(ref_obj, "id"):
                parent_id = str(ref_obj.id)
            elif isinstance(ref_obj, dict):
                parent_id = str(ref_obj.get("_id", ""))
            else:
                parent_id = str(ref_obj)
        elif isinstance(child.parent, dict):
            parent_id = str(child.parent.get("_id", ""))

        if parent_id == user_id_str:
            user_children.append(child)

    return user_children


async def get_child_tasks_by_child(child: Child) -> list[ChildTask]:
    """
    Get all ChildTasks belonging to a child.
    Handles both Link references and nested object formats.
    """
    from beanie import Link

    try:
        tasks = await ChildTask.find(ChildTask.child == Link(child, Child)).to_list()
        if tasks:
            return tasks
    except Exception:
        pass

    all_tasks = await ChildTask.find_all().to_list()
    child_tasks: list[ChildTask] = []
    child_id_str = str(child.id)

    for task in all_tasks:
        task_child_id = None

        if hasattr(task.child, "id"):
            task_child_id = str(task.child.id)
        elif hasattr(task.child, "ref"):
            ref_obj = task.child.ref
            if hasattr(ref_obj, "id"):
                task_child_id = str(ref_obj.id)
            elif isinstance(ref_obj, dict):
                task_child_id = str(ref_obj.get("_id", ""))
            else:
                task_child_id = str(ref_obj)
        elif isinstance(task.child, dict):
            task_child_id = str(task.child.get("_id", ""))

        if task_child_id == child_id_str:
            child_tasks.append(task)

    return child_tasks


def extract_id_from_link(link_ref) -> Optional[str]:
    """
    Extract ID from a Beanie Link reference.
    Handles various formats: Link object, dict, or direct ID.
    """
    if hasattr(link_ref, "id"):
        return str(link_ref.id)
    if hasattr(link_ref, "ref"):
        ref_obj = link_ref.ref
        if hasattr(ref_obj, "id"):
            return str(ref_obj.id)
        if isinstance(ref_obj, dict):
            return str(ref_obj.get("_id", ""))
        return str(ref_obj)
    if isinstance(link_ref, dict):
        return str(link_ref.get("_id", ""))
    return None


async def fetch_link_or_get_object(link_ref, model_class):
    """
    Fetch a Link reference or return the object if it's already fetched.
    Handles both Link references and already-fetched objects.
    """
    if link_ref is None:
        return None

    if isinstance(link_ref, model_class):
        return link_ref

    from beanie import Link

    if isinstance(link_ref, Link):
        try:
            fetched = await link_ref.fetch()
            if isinstance(fetched, model_class):
                return fetched
        except Exception:
            pass

    if hasattr(link_ref, "fetch"):
        try:
            fetched = await link_ref.fetch()
            if isinstance(fetched, model_class):
                return fetched
        except Exception:
            pass

    if isinstance(link_ref, dict):
        obj_id = link_ref.get("_id")
        if obj_id:
            try:
                return await model_class.get(obj_id)
            except Exception:
                pass

    if hasattr(link_ref, "id"):
        try:
            obj_id = link_ref.id
            if obj_id:
                return await model_class.get(obj_id)
        except Exception:
            pass

    return None


async def ensure_link_references_for_save(child_task, child: Child) -> None:
    """
    Ensure Link references are properly set before saving ChildTask.
    Always recreate Link references from IDs to avoid serialization issues.
    """
    from beanie import Link

    from app.models.task_models import Task

    child_task.child = Link(child, Child)

    task_id = extract_id_from_link(child_task.task)
    if task_id and task_id not in ("None", "null", ""):
        try:
            task_ref = await Task.get(task_id)
            if task_ref:
                child_task.task = Link(task_ref, Task)
        except Exception:
            pass


async def verify_reward_ownership(reward_id: str, current_user: User):
    """
    Verify that the current user owns the reward.
    Returns the reward if ownership is verified.
    """
    from fastapi import HTTPException, status

    from app.models.reward_models import Reward

    reward = await Reward.get(reward_id)
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found",
        )

    if reward.created_by is None:
        return reward

    created_by_id = extract_id_from_link(reward.created_by)
    current_user_id = str(current_user.id)

    if not created_by_id or created_by_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this reward",
        )

    return reward
