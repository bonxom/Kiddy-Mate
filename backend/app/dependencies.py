from fastapi import Depends, HTTPException, status
from app.models.child_models import Child
from app.models.user_models import User
from app.services.auth import get_current_user

async def verify_child_ownership(
    child_id: str,
    current_user: User = Depends(get_current_user)
) -> Child:
    """Verify that the current user owns the child profile without fetching links"""
    child = await Child.get(child_id)
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found."
        )
    parent_id_from_link = None
    if getattr(child.parent, "id", None) is not None:
        parent_id_from_link = str(child.parent.id)
    elif getattr(child.parent, "ref", None) is not None:
        ref_obj = child.parent.ref
        parent_id_from_link = str(getattr(ref_obj, "id", ref_obj))

    if parent_id_from_link != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this child profile."
        )
    return child