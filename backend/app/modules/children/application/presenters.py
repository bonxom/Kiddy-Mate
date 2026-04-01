from app.modules.children.domain.models import Child
from app.schemas.schemas import ChildPublic


def to_child_public(child: Child) -> ChildPublic:
    return ChildPublic(
        id=str(child.id),
        name=child.name,
        birth_date=child.birth_date,
        initial_traits=child.initial_traits,
        current_coins=child.current_coins,
        level=child.level,
        nickname=child.nickname,
        gender=child.gender,
        avatar_url=child.avatar_url,
        personality=child.personality,
        interests=child.interests,
        strengths=child.strengths,
        challenges=child.challenges,
    )
