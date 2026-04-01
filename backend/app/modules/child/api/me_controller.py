from fastapi import APIRouter, Depends

from app.core.security.dependencies import get_authenticated_child
from app.modules.children.application.presenters import to_child_public
from app.modules.children.domain.models import Child
from app.schemas.schemas import ChildPublic

router = APIRouter()


@router.get("/me", response_model=ChildPublic)
async def get_me(child: Child = Depends(get_authenticated_child)) -> ChildPublic:
    return to_child_public(child)
