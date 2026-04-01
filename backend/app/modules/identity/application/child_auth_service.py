from pydantic import BaseModel
from datetime import timedelta

from app.config import settings
from app.modules.child.domain.errors import ChildUnauthorizedError
from app.modules.children.domain.models import Child
from app.modules.identity.domain.child_auth_repositories import ChildAuthRepository
from app.modules.identity.infrastructure.child_auth_repository import BeanieChildAuthRepository
from app.core.security.child_context import build_child_auth_context, child_context_to_token_claims
from app.services.auth import create_access_token, verify_password

class ChildLoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_type: str  # "child"
    child_id: str
    child_name: str
    username: str | None = None

def _repository(repository: ChildAuthRepository | None = None) -> ChildAuthRepository:
    return repository or BeanieChildAuthRepository()


async def authenticate_child(
    username: str,
    password: str,
    repository: ChildAuthRepository | None = None,
) -> Child:
    """Authenticate child by username and password."""
    repo = _repository(repository)
    child = await repo.get_child_by_username(username)
    if not child or not child.password_hash or not verify_password(password, child.password_hash):
        raise ChildUnauthorizedError("Invalid username or password.")
    return child

async def login_child(
    request: ChildLoginRequest,
    repository: ChildAuthRepository | None = None,
):
    """
    Child login endpoint using username and password.
    Returns access token with child information.
    """
    child = await authenticate_child(request.username, request.password, repository=repository)

    auth_context = build_child_auth_context(child=child)
    access_token = create_access_token(
        data=child_context_to_token_claims(auth_context),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": "child",
        "child_id": auth_context.child_id,
        "child_name": auth_context.display_name,
        "username": auth_context.username,
    }
