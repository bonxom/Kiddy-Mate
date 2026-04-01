from fastapi import Depends, HTTPException, status

from app.core.security.child_context import ChildAuthContext
from app.models.child_models import Child
from app.models.user_models import User, UserRole
from app.services.auth import get_current_child_auth_context, get_current_user
from app.shared.query_helpers import extract_id_from_link


async def require_parent_principal(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.PARENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This endpoint requires parent role.",
        )
    return current_user


async def require_child_principal(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.CHILD:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This endpoint requires child role.",
        )
    if not current_user.child_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Child profile not linked to user account.",
        )
    return current_user


async def require_child_auth_context(
    child_context: ChildAuthContext = Depends(get_current_child_auth_context),
) -> ChildAuthContext:
    return child_context


async def get_authenticated_child(
    child_context: ChildAuthContext = Depends(require_child_auth_context),
) -> Child:
    child = await Child.get(child_context.child_id)
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child profile not found.",
        )

    return child


async def resolve_parent_owned_child(
    child_id: str,
    current_user: User = Depends(require_parent_principal),
) -> Child:
    normalized_child_id = child_id.strip()
    child = await Child.get(normalized_child_id)
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found.",
        )

    parent_id = extract_id_from_link(child.parent)
    if not parent_id or parent_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this child profile.",
        )

    return child


async def resolve_child_for_current_actor(
    child_id: str,
    current_user: User = Depends(get_current_user),
) -> Child:
    normalized_child_id = child_id.strip()

    child = await Child.get(normalized_child_id)
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found.",
        )

    if current_user.role == UserRole.PARENT:
        parent_id = extract_id_from_link(child.parent)
        if not parent_id or parent_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not own this child profile.",
            )
        return child

    if current_user.role == UserRole.CHILD:
        child_profile_id = extract_id_from_link(current_user.child_profile)
        if child_profile_id == str(child.id):
            return child
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only access your own profile.",
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: Invalid user role.",
    )
