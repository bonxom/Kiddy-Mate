from fastapi import APIRouter

from app.modules.identity.application import child_auth_service as service

router = APIRouter()


@router.post("/login", response_model=service.TokenResponse)
async def login_child(request: service.ChildLoginRequest) -> service.TokenResponse:
    return await service.login_child(request=request)
