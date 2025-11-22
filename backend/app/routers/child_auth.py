from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.services.auth import verify_password, create_access_token
from app.models.child_models import Child
from datetime import timedelta
from app.config import settings

router = APIRouter()

class ChildLoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_type: str  # "child"
    child_id: str
    child_name: str

async def authenticate_child(username: str, password: str) -> Child:
    """Authenticate child by username and password."""
    child = await Child.find_one(Child.username == username)
    if not child or not child.password_hash or not verify_password(password, child.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )
    return child

@router.post("/child/login", response_model=TokenResponse)
async def login_child(request: ChildLoginRequest):
    """
    Child login endpoint using username and password.
    Returns access token with child information.
    """
    child = await authenticate_child(request.username, request.password)
    
    # Create token with child identifier
    access_token = create_access_token(
        data={
            "sub": str(child.id),  # Use child ID instead of email
            "type": "child"  # Mark this as child token
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": "child",
        "child_id": str(child.id),
        "child_name": child.nickname or child.name
    }
