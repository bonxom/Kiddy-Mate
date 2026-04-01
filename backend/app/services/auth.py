import bcrypt
from datetime import datetime, timedelta
from app.core.time import utc_now
from jose import JWTError, jwt
from typing import Any, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import build_child_principal
from app.core.security.child_context import ChildAuthContext, build_child_auth_context
from app.models.child_models import Child
from app.models.user_models import User
from app.config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/parent/auth/token")


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = utc_now() + expires_delta
    else:
        expire = utc_now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any]:
    credentials_exception = _credentials_exception()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception


async def _get_child_from_claims(
    subject: str,
    child_username: Optional[str] = None,
) -> Optional[Child]:
    try:
        child = await Child.get(subject)
    except Exception:
        child = None

    if child is not None:
        return child

    if child_username:
        child = await Child.find_one(Child.username == child_username)
        if child is not None:
            return child

    return await Child.find_one(Child.username == subject)


async def get_current_child_auth_context(
    token: str = Depends(oauth2_scheme),
) -> ChildAuthContext:
    payload = decode_access_token(token)
    if payload.get("type") != "child":
        raise _credentials_exception()

    child_subject = payload.get("child_id") or payload.get("sub")
    child_username = payload.get("child_username")
    child = await _get_child_from_claims(child_subject, child_username)
    if child is None:
        raise _credentials_exception()

    return build_child_auth_context(child)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Get the current authenticated principal from JWT.

    Supported token modes:
    - parent/user tokens with `sub=<user email>`
    - child tokens with `type=child` and `sub=<child id>`
    """
    payload = decode_access_token(token)
    subject: str = payload.get("sub")
    token_type: Optional[str] = payload.get("type")

    user = await User.find_one(User.email == subject)
    if user is not None:
        return user

    if token_type == "child":
        child = await _get_child_from_claims(
            subject,
            payload.get("child_username"),
        )
        if child is not None:
            return build_child_principal(child)

    # Final fallback: some environments may issue child-linked user accounts.
    user = await User.find_one(User.email == subject)
    if user is None:
        raise _credentials_exception()
    return user
