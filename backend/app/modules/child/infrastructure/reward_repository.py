from __future__ import annotations

from app.modules.child.domain.reward_repositories import ChildRewardRepository
from app.modules.children.domain.models import Child
from app.modules.identity.domain.models import User
from app.modules.rewards.domain.models import ChildReward, RedemptionRequest, Reward
from app.shared.query_helpers import ensure_reward_references_for_save, extract_id_from_link, fetch_link_or_get_object


class BeanieChildRewardRepository(ChildRewardRepository):
    async def get_reward(self, reward_id: str) -> Reward | None:
        return await Reward.get(reward_id)

    async def get_parent(self, child: Child) -> User | None:
        return await fetch_link_or_get_object(child.parent, User)

    async def create_redemption_request(self, redemption_request: RedemptionRequest) -> RedemptionRequest:
        await redemption_request.insert()
        return redemption_request

    async def list_child_rewards(self, child: Child) -> list[ChildReward]:
        child_rewards = await ChildReward.find_all().to_list()
        return [
            child_reward
            for child_reward in child_rewards
            if extract_id_from_link(child_reward.child) == str(child.id)
        ]

    async def load_reward(self, child_reward: ChildReward) -> Reward | None:
        return await fetch_link_or_get_object(child_reward.reward, Reward)

    async def list_equipped_rewards(self, child: Child) -> list[ChildReward]:
        child_rewards = await self.list_child_rewards(child)
        return [reward for reward in child_rewards if reward.is_equipped]

    async def save_child_reward(self, child_reward: ChildReward) -> ChildReward:
        child_doc = await fetch_link_or_get_object(child_reward.child, Child)
        if child_doc is not None:
            await ensure_reward_references_for_save(child_reward, child_doc)
        await child_reward.save()
        return child_reward
