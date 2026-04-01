from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.modules.identity.application import parent_auth_service as service
from app.models.user_models import User
from app.services.auth import get_current_user
from app.core.security.dependencies import require_parent_principal

router = APIRouter()


@router.post("/register", response_model=dict)
async def register_user(request: service.RegisterRequest) -> dict:
    return await service.register_user(request=request)


@router.post("/login", response_model=service.TokenResponse)
async def login_user(request: service.LoginRequest) -> service.TokenResponse:
    return await service.login_user(request=request)


@router.post("/token", response_model=service.TokenResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> service.TokenResponse:
    return await service.login_for_access_token(form_data=form_data)


@router.post("/logout", response_model=dict)
async def logout_user(
    current_user: User = Depends(get_current_user),
) -> dict:
    return await service.logout_user(current_user=current_user)


@router.post("/register/child", response_model=dict)
async def register_child(
    request: service.RegisterChildRequest,
    current_user: User = Depends(require_parent_principal),
) -> dict:
    return await service.register_child(request=request, current_user=current_user)


@router.get("/me", response_model=dict)
async def get_me(current_user: User = Depends(get_current_user)) -> dict:
    return await service.get_me(current_user=current_user)


@router.put("/me", response_model=dict)
async def update_profile(
    request: service.UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    return await service.update_profile(request=request, current_user=current_user)


@router.put("/me/password", response_model=dict)
async def change_password(
    request: service.ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    return await service.change_password(request=request, current_user=current_user)


@router.delete("/me", response_model=dict)
async def delete_account(
    request: service.DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    return await service.delete_account(request=request, current_user=current_user)


@router.get("/me/notification-settings", response_model=dict)
async def get_notification_settings(
    current_user: User = Depends(get_current_user),
) -> dict:
    return await service.get_notification_settings(current_user=current_user)


@router.put("/me/notification-settings", response_model=dict)
async def update_notification_settings(
    settings: service.NotificationSettings,
    current_user: User = Depends(get_current_user),
) -> dict:
    return await service.update_notification_settings(
        settings=settings,
        current_user=current_user,
    )
