from __future__ import annotations

from pydantic import BaseModel

from app.core.security.child_context import ChildAuthContext, build_child_auth_context
from app.core.locale import localize_message
from app.modules.child.domain.errors import ChildForbiddenError, ChildNotFoundError, ChildValidationError
from app.modules.child.domain.reward_repositories import ChildRewardRepository
from app.modules.child.infrastructure.reward_repository import BeanieChildRewardRepository
from app.modules.children.domain.models import Child
from app.modules.rewards.domain.models import RedemptionRequest, RewardType
from app.shared.query_helpers import extract_id_from_link


class RedeemRewardRequest(BaseModel):
    reward_id: str


def _child_context(child: Child) -> ChildAuthContext:
    return build_child_auth_context(child=child)


def _repository(repository: ChildRewardRepository | None = None) -> ChildRewardRepository:
    return repository or BeanieChildRewardRepository()


async def redeem_reward(
    request: RedeemRewardRequest,
    child: Child,
    context: ChildAuthContext | None = None,
    repository: ChildRewardRepository | None = None,
) -> dict:
    _ = context or _child_context(child)
    repo = _repository(repository)
    reward = await repo.get_reward(request.reward_id)
    if not reward:
        raise ChildNotFoundError("Reward not found")
    if not reward.is_active:
        raise ChildValidationError("Reward is not available")

    if reward.created_by is not None:
        child_parent = await repo.get_parent(child)
        if not child_parent:
            raise ChildNotFoundError("Parent account not found for this child")
        reward_owner_id = extract_id_from_link(reward.created_by)
        if reward_owner_id != str(child_parent.id):
            raise ChildForbiddenError("Forbidden: This reward does not belong to your parent")

    if child.current_coins < reward.cost_coins:
        raise ChildValidationError(
            f"Insufficient coins. Need {reward.cost_coins}, have {child.current_coins}"
        )

    redemption = RedemptionRequest(
        child=child,  # type: ignore[arg-type]
        reward=reward,  # type: ignore[arg-type]
        cost_coins=reward.cost_coins,
    )
    redemption = await repo.create_redemption_request(redemption)
    return {
        "id": str(redemption.id),
        "message": localize_message(
            "Redemption request created. Waiting for parent approval.",
            "Da tao yeu cau doi thuong. Dang cho phu huynh phe duyet.",
        ),
        "cost": reward.cost_coins,
    }


async def get_inventory(
    child: Child,
    context: ChildAuthContext | None = None,
    repository: ChildRewardRepository | None = None,
) -> list[dict]:
    _ = context or _child_context(child)
    repo = _repository(repository)
    child_rewards = await repo.list_child_rewards(child)

    results: list[dict] = []
    for child_reward in child_rewards:
        reward = await repo.load_reward(child_reward)
        if not reward:
            continue
        results.append(
            {
                "id": str(child_reward.id),
                "earned_at": child_reward.earned_at.isoformat(),
                "is_equipped": child_reward.is_equipped,
                "reward": {
                    "id": str(reward.id),
                    "name": reward.name,
                    "description": reward.description,
                    "type": reward.type,
                    "image_url": reward.image_url,
                },
            }
        )
    return results


async def equip_avatar_skin(
    reward_id: str,
    child: Child,
    context: ChildAuthContext | None = None,
    repository: ChildRewardRepository | None = None,
) -> dict:
    _ = context or _child_context(child)
    repo = _repository(repository)
    reward = await repo.get_reward(reward_id)
    if not reward:
        raise ChildNotFoundError("Reward not found.")

    child_rewards = await repo.list_child_rewards(child)
    child_reward = next(
        (
            candidate
            for candidate in child_rewards
            if getattr(candidate.reward, "id", None) is not None and str(candidate.reward.id) == str(reward.id)
        ),
        None,
    )
    if not child_reward:
        for candidate in child_rewards:
            reward_doc = await repo.load_reward(candidate)
            if reward_doc and str(reward_doc.id) == str(reward.id):
                child_reward = candidate
                break

    if not child_reward:
        raise ChildNotFoundError("Reward not found in child's inventory.")
    if reward.type != RewardType.SKIN:
        raise ChildValidationError("Invalid reward type for equipping. Only skins can be equipped.")

    equipped_rewards = await repo.list_equipped_rewards(child)
    for equipped_reward in equipped_rewards:
        if str(equipped_reward.id) != str(child_reward.id):
            equipped_reward.is_equipped = False
            await repo.save_child_reward(equipped_reward)

    child_reward.is_equipped = True
    await repo.save_child_reward(child_reward)
    return {
        "message": localize_message(
            "Skin equipped successfully.",
            "Da trang bi vat pham thanh cong.",
        ),
        "reward_id": reward_id,
    }
