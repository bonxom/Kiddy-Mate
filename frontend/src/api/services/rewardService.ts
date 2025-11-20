/**
 * Reward API Service
 * Handles reward inventory and equipment operations
 */

import axiosClient from '../client/axiosClient';

export type RewardType = 'badge' | 'skin' | 'item';

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  image_url?: string;
}

export interface ChildReward {
  id: string;
  reward_id: string;
  earned_at: string;
  is_equipped?: boolean;
}

export interface ChildRewardWithDetails extends ChildReward {
  reward: Reward;
}

/**
 * Get child's reward inventory
 */
export const getInventory = async (childId: string): Promise<ChildReward[]> => {
  const response = await axiosClient.get<ChildReward[]>(
    `/children/${childId}/inventory`
  );
  return response.data;
};

/**
 * Equip a skin/avatar reward
 */
export const equipSkin = async (
  childId: string,
  rewardId: string
): Promise<{ message: string }> => {
  const response = await axiosClient.post<{ message: string }>(
    `/children/${childId}/avatar/equip`,
    null,
    { params: { reward_id: rewardId } }
  );
  return response.data;
};

export default {
  getInventory,
  equipSkin,
};
