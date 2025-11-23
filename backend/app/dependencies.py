from fastapi import Depends, HTTPException, status
from app.models.child_models import Child
from app.models.user_models import User, UserRole
from app.models.childtask_models import ChildTask
from app.services.auth import get_current_user
from typing import List, Optional

async def verify_child_ownership(
    child_id: str,
    current_user: User = Depends(get_current_user)
) -> Child:
    """
    Verify that the current user owns the child profile.
    Allows both parent (who owns the child) and child (who is the child) to access.
    """
    import logging
    
    child_id = child_id.strip()
    
    child = await Child.get(child_id)
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found."
        )
    
    # Check PARENT role first (most common case)
    if current_user.role == UserRole.PARENT:
        # Fetch parent if it's a Link reference
        parent_id_from_link = None
        
        # Try to get parent ID from various formats
        if child.parent is None:
            logging.warning(f"Child {child_id} has no parent assigned")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Child has no parent assigned."
            )
        
        # Method 1: If parent is already a User instance
        if isinstance(child.parent, User):
            parent_id_from_link = str(child.parent.id)
        # Method 2: If parent is a Link, try to fetch it
        elif hasattr(child.parent, 'fetch'):
            try:
                parent = await child.parent.fetch()
                if isinstance(parent, User):
                    parent_id_from_link = str(parent.id)
            except Exception as e:
                logging.warning(f"Failed to fetch parent link via fetch(): {e}")
        
        # Method 3: Try to extract ID directly from Link object
        if not parent_id_from_link:
            try:
                # Try accessing .id directly (might work for some Link formats)
                if hasattr(child.parent, "id") and child.parent.id:
                    parent_id_from_link = str(child.parent.id)
            except Exception:
                pass
        
        # Method 4: Try to extract from ref attribute
        if not parent_id_from_link:
            try:
                if hasattr(child.parent, "ref"):
                    ref_obj = child.parent.ref
                    if hasattr(ref_obj, "id"):
                        parent_id_from_link = str(ref_obj.id)
                    elif isinstance(ref_obj, dict):
                        parent_id_from_link = str(ref_obj.get("_id", ""))
                    else:
                        # Try to convert to string and use as ID
                        parent_id_from_link = str(ref_obj)
            except Exception as e:
                logging.warning(f"Failed to extract parent ID from ref: {e}")
        
        # Method 5: Try dict format
        if not parent_id_from_link:
            try:
                if isinstance(child.parent, dict):
                    parent_id_from_link = str(child.parent.get("_id", ""))
            except Exception:
                pass
        
        # Method 6: Use extract_id_from_link helper
        if not parent_id_from_link:
            try:
                parent_id_from_link = extract_id_from_link(child.parent)
            except Exception as e:
                logging.warning(f"Failed to extract parent ID via helper: {e}")
        
        current_user_id = str(current_user.id)
        logging.info(f"Verifying parent ownership: child.parent={parent_id_from_link}, current_user={current_user_id}, child_id={child_id}")
        
        if not parent_id_from_link or parent_id_from_link != current_user_id:
            logging.warning(f"Parent mismatch: child.parent={parent_id_from_link}, current_user={current_user_id}, child_id={child_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not own this child profile."
            )
        return child
    
    # Check CHILD role
    if current_user.role == UserRole.CHILD:
        if current_user.child_profile:
            
            child_profile_id = None
            if hasattr(current_user.child_profile, 'id'):
                child_profile_id = str(current_user.child_profile.id)
            elif hasattr(current_user.child_profile, 'ref'):
                ref_obj = current_user.child_profile.ref
                if hasattr(ref_obj, 'id'):
                    child_profile_id = str(ref_obj.id)
                elif isinstance(ref_obj, dict):
                    child_profile_id = str(ref_obj.get('_id', ''))
                else:
                    child_profile_id = str(ref_obj)
            elif isinstance(current_user.child_profile, dict):
                child_profile_id = str(current_user.child_profile.get('_id', ''))
            
            if child_profile_id == str(child.id):
                return child
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only access your own profile."
        )
    
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: Invalid user role."
    )

async def verify_parent_token(
    current_user: User = Depends(get_current_user)
) -> User:
    """Verify that the current user is a parent (has full access)"""
    if current_user.role != UserRole.PARENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This endpoint requires parent role."
        )
    return current_user

async def verify_child_token(
    current_user: User = Depends(get_current_user),
    allowed_paths: Optional[List[str]] = None
) -> User:
    """
    Verify that the current user is a child and check if endpoint is whitelisted.
    
    Args:
        current_user: Current authenticated user
        allowed_paths: List of allowed endpoint paths (e.g., ['/children/{id}/tasks', '/children/{id}/games'])
    
    Returns:
        User: Verified child user
        
    Note: For now, we allow child to access their own endpoints. 
    In production, implement proper whitelist checking.
    """
    if current_user.role != UserRole.CHILD:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This endpoint requires child role."
        )
    
    if not current_user.child_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Child profile not linked to user account."
        )
    
    
    
    
    
    
    return current_user

async def get_child_from_token(
    current_user: User = Depends(verify_child_token)
) -> Child:
    """Get child profile from authenticated child user token"""
    if not current_user.child_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Child profile not linked to user account."
        )
    
    
    child = None
    if hasattr(current_user.child_profile, 'fetch'):
        
        child = await current_user.child_profile.fetch()
    elif isinstance(current_user.child_profile, Child):
        
        child = current_user.child_profile
    else:
        
        child_id = None
        if hasattr(current_user.child_profile, 'id'):
            child_id = str(current_user.child_profile.id)
        elif isinstance(current_user.child_profile, dict):
            child_id = str(current_user.child_profile.get('_id', ''))
        
        if child_id:
            child = await Child.get(child_id)
    
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child profile not found."
        )
    return child

async def get_user_children(user: User) -> List[Child]:
    """
    Get all children belonging to a user.
    Handles both Link references and nested object formats.
    """
    from app.models.child_models import Child
    from beanie import Link
    
    
    try:
        children = await Child.find(Child.parent == Link(user, User)).to_list()
        if children:
            return children
    except Exception:
        pass
    
    
    all_children = await Child.find_all().to_list()
    user_children = []
    user_id_str = str(user.id)
    
    for child in all_children:
        parent_id = None
        
        
        if hasattr(child.parent, 'id'):
            parent_id = str(child.parent.id)
        elif hasattr(child.parent, 'ref'):
            ref_obj = child.parent.ref
            if hasattr(ref_obj, 'id'):
                parent_id = str(ref_obj.id)
            elif isinstance(ref_obj, dict):
                parent_id = str(ref_obj.get('_id', ''))
            else:
                parent_id = str(ref_obj)
        elif isinstance(child.parent, dict):
            
            parent_id = str(child.parent.get('_id', ''))
        
        if parent_id == user_id_str:
            user_children.append(child)
    
    return user_children

async def get_child_tasks_by_child(child: Child) -> List[ChildTask]:
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
    child_tasks = []
    child_id_str = str(child.id)
    
    for task in all_tasks:
        task_child_id = None
        
        
        if hasattr(task.child, 'id'):
            task_child_id = str(task.child.id)
        elif hasattr(task.child, 'ref'):
            ref_obj = task.child.ref
            if hasattr(ref_obj, 'id'):
                task_child_id = str(ref_obj.id)
            elif isinstance(ref_obj, dict):
                task_child_id = str(ref_obj.get('_id', ''))
            else:
                task_child_id = str(ref_obj)
        elif isinstance(task.child, dict):
            
            task_child_id = str(task.child.get('_id', ''))
        
        if task_child_id == child_id_str:
            child_tasks.append(task)
    
    return child_tasks

def extract_id_from_link(link_ref) -> Optional[str]:
    """
    Extract ID from a Beanie Link reference.
    Handles various formats: Link object, dict, or direct ID.
    """
    if hasattr(link_ref, 'id'):
        return str(link_ref.id)
    elif hasattr(link_ref, 'ref'):
        ref_obj = link_ref.ref
        if hasattr(ref_obj, 'id'):
            return str(ref_obj.id)
        elif isinstance(ref_obj, dict):
            return str(ref_obj.get('_id', ''))
        else:
            return str(ref_obj)
    elif isinstance(link_ref, dict):
        return str(link_ref.get('_id', ''))
    return None

async def fetch_link_or_get_object(link_ref, model_class):
    """
    Fetch a Link reference or return the object if it's already fetched.
    Handles both Link references and already-fetched objects.
    """
    if link_ref is None:
        return None
    
    # If it's already the model instance, return it
    if isinstance(link_ref, model_class):
        return link_ref
    
    # Check if it's a Beanie Link
    from beanie import Link
    if isinstance(link_ref, Link):
        try:
            # Try to fetch the linked object
            fetched = await link_ref.fetch()
            if isinstance(fetched, model_class):
                return fetched
        except Exception:
            pass
    
    # If it has a fetch method, call it
    if hasattr(link_ref, 'fetch'):
        try:
            fetched = await link_ref.fetch()
            if isinstance(fetched, model_class):
                return fetched
        except Exception:
            pass
    
    # If it's a dict, try to get the object by ID
    if isinstance(link_ref, dict):
        obj_id = link_ref.get('_id')
        if obj_id:
            try:
                return await model_class.get(obj_id)
            except Exception:
                pass
    
    # If it has an id attribute, try to get the object
    if hasattr(link_ref, 'id'):
        try:
            obj_id = link_ref.id
            if obj_id:
                return await model_class.get(obj_id)
        except Exception:
            pass
    
    return None

async def ensure_link_references_for_save(child_task, child):
    """
    Ensure Link references are properly set before saving ChildTask.
    Always recreate Link references from IDs to avoid serialization issues.
    """
    from beanie import Link
    from app.models.child_models import Child
    from app.models.task_models import Task
    
    
    child_task.child = Link(child, Child)
    
    
    task_id = extract_id_from_link(child_task.task)
    if task_id and task_id not in ('None', 'null', ''):
        try:
            task_ref = await Task.get(task_id)
            if task_ref and hasattr(task_ref, 'id') and task_ref.id:
                child_task.task = Link(task_ref, Task)
            else:
                
                task_ref = await Task.get(task_id)
                if task_ref:
                    child_task.task = Link(task_ref, Task)
        except Exception as e:
            
            
            pass

async def verify_reward_ownership(reward_id: str, current_user: User):
    """
    Verify that the current user owns the reward.
    Returns the reward if ownership is verified, raises HTTPException otherwise.
    """
    from app.models.reward_models import Reward
    from fastapi import HTTPException, status
    
    reward = await Reward.get(reward_id)
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found"
        )
    
    # If reward has no created_by, allow access (backward compatibility)
    if reward.created_by is None:
        return reward
    
    # Extract created_by user ID
    created_by_id = extract_id_from_link(reward.created_by)
    current_user_id = str(current_user.id)
    
    if not created_by_id or created_by_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this reward"
        )
    
    return reward