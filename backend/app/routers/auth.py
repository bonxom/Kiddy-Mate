from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from app.services.auth import hash_password, verify_password, create_access_token, get_current_user
from app.models.user_models import User
from datetime import timedelta, datetime
from app.config import settings

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: str | None = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UpdateProfileRequest(BaseModel):
    full_name: str
    phone_number: str | None = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class DeleteAccountRequest(BaseModel):
    confirmation: str  # Must be "DELETE"
    password: str

class NotificationSettings(BaseModel):
    email: dict  # { enabled: bool, coin_redemption: bool, ... }
    push: dict

@router.post("/register", response_model=dict)
async def register_user(request: RegisterRequest):
    existing_user = await User.find_one(User.email == request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists."
        )
    new_user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        full_name=request.full_name
    )
    await new_user.insert()
    return {"message": "Đăng ký thành công."}

async def authenticate_user(email: str, password: str) -> User:
    user = await User.find_one(User.email == email)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    return user

@router.post("/login", response_model=TokenResponse)
async def login_user(request: LoginRequest):
    """
    Login endpoint using JSON (for Swagger UI).
    Use /token endpoint for OAuth2 form data.
    """
    user = await authenticate_user(request.email, request.password)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token endpoint (form data).
    Use 'username' field for email.
    """
    user = await authenticate_user(form_data.username, form_data.password)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout", response_model=dict)
async def logout_user(current_user: User = Depends(get_current_user)):
    """
    Logout endpoint - invalidates the current session.
    Client should clear token from localStorage.
    """
    # Update last activity timestamp
    current_user.updated_at = datetime.utcnow()
    await current_user.save()
    
    return {"message": "Logout successful"}

@router.get("/me", response_model=dict)
async def get_me(current_user: User = Depends(get_current_user)):
    from app.models.child_models import Child
    
    # Get children count
    children = await Child.find(Child.parent.id == current_user.id).to_list()
    
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone_number": current_user.phone_number,
        "onboarding_completed": current_user.onboarding_completed,
        "children_count": len(children),
        "created_at": current_user.created_at.isoformat()
    }

@router.put("/me", response_model=dict)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user)
):
    """Update user profile (full name and phone number)."""
    current_user.full_name = request.full_name
    current_user.phone_number = request.phone_number
    current_user.updated_at = datetime.utcnow()
    
    await current_user.save()
    
    return {
        "message": "Profile updated successfully",
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "phone_number": current_user.phone_number
        }
    }

@router.put("/me/password", response_model=dict)
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user)
):
    """Change user password with current password verification."""
    # Verify current password
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password strength (at least 8 chars)
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters"
        )
    
    # Update password
    current_user.password_hash = hash_password(request.new_password)
    current_user.updated_at = datetime.utcnow()
    await current_user.save()
    
    return {"message": "Password updated successfully"}

@router.delete("/me", response_model=dict)
async def delete_account(
    request: DeleteAccountRequest,
    current_user: User = Depends(get_current_user)
):
    """Delete user account and all associated data."""
    # Verify confirmation text
    if request.confirmation != "DELETE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid confirmation text. Type DELETE to confirm."
        )
    
    # Verify password
    if not verify_password(request.password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    # Delete all children and associated data
    from app.models.child_models import Child
    children = await Child.find(Child.parent.id == current_user.id).to_list()
    
    for child in children:
        # Delete all child-related data (tasks, rewards, assessments, etc.)
        from app.models.childtask_models import ChildTask
        from app.models.reward_models import ChildReward
        from app.models.child_models import ChildDevelopmentAssessment
        from app.models.gamesession_models import GameSession
        from app.models.interactionlog_models import InteractionLog
        
        await ChildTask.find(ChildTask.child.id == child.id).delete()
        await ChildReward.find(ChildReward.child.id == child.id).delete()
        await ChildDevelopmentAssessment.find(
            ChildDevelopmentAssessment.child.id == child.id
        ).delete()
        await GameSession.find(GameSession.child.id == child.id).delete()
        await InteractionLog.find(InteractionLog.child.id == child.id).delete()
        
        # Delete child
        await child.delete()
    
    # Delete user
    await current_user.delete()
    
    return {"message": "Account and all associated data deleted successfully"}

@router.get("/me/notification-settings", response_model=dict)
async def get_notification_settings(
    current_user: User = Depends(get_current_user)
):
    """Get user notification preferences."""
    # Return default settings if not set
    if not current_user.notification_settings:
        default_settings = {
            "email": {
                "enabled": True,
                "coin_redemption": True,
                "task_reminders": True,
                "emotional_trends": False,
                "weekly_reports": True
            },
            "push": {
                "enabled": False,
                "coin_redemption": False,
                "task_reminders": True,
                "emotional_trends": False,
                "weekly_reports": False
            }
        }
        return default_settings
    
    return current_user.notification_settings

@router.put("/me/notification-settings", response_model=dict)
async def update_notification_settings(
    settings: NotificationSettings,
    current_user: User = Depends(get_current_user)
):
    """Update user notification preferences."""
    # Convert Pydantic model to dict
    settings_dict = {
        "email": settings.email,
        "push": settings.push
    }
    
    current_user.notification_settings = settings_dict
    current_user.updated_at = datetime.utcnow()
    await current_user.save()
    
    return {
        "message": "Notification settings updated successfully",
        "settings": settings_dict
    }
