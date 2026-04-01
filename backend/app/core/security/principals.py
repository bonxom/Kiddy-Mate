from app.models.child_models import Child
from app.models.user_models import User, UserRole


def build_child_principal(child: Child) -> User:
    """
    Build an in-memory child principal that is compatible with existing
    dependency checks.

    This is used when authentication is performed directly against the
    Child document instead of a persisted User(role=CHILD) account.
    """
    return User(
        id=child.id,
        email=f"child-{child.id}@auth.kiddymate.app",
        password_hash="!",
        full_name=child.nickname or child.name,
        role=UserRole.CHILD,
        child_profile=child,
        onboarding_completed=True,
    )
