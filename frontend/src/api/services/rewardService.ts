/**
 * Reward API Service
 * Handles reward shop, inventory and redemption operations
 */

import axiosClient from '../client/axiosClient';

export type RewardType = 'badge' | 'skin' | 'item';
export type RedemptionStatus = 'pending' | 'approved' | 'rejected';

// ============== INTERFACES ==============

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  url_thumbnail?: string;
  cost: number;
  remain: number;
  is_active: boolean;
}

export interface RewardCreate {
  name: string;
  description: string;
  type: RewardType;
  image_url?: string;
  cost_coins: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface RewardUpdate {
  name?: string;
  description?: string;
  image_url?: string;
  cost_coins?: number;
  stock_quantity?: number;
  is_active?: boolean;
}

export interface RedemptionRequest {
  id: string;
  child: string;
  childId: string;
  rewardName: string;
  rewardId: string;
  dateCreated: string;
  cost: number;
  status: RedemptionStatus;
}

export interface ChildReward {
  id: string;
  reward_id: string;
  earned_at: string;
  is_equipped?: boolean;
}

export interface ChildRewardWithDetails extends ChildReward {
  reward: {
    id: string;
    name: string;
    description: string;
    type: RewardType;
    image_url?: string;
  };
}

// ============== SHOP MANAGEMENT ==============

/**
 * Get all rewards in shop (parent)
 */
export const getAllRewards = async (params?: {
  is_active?: boolean;
  type?: RewardType;
}): Promise<Reward[]> => {
  const response = await axiosClient.get<Reward[]>('/shop/rewards', { params });
  return response.data;
};

/**
 * Create new reward (parent)
 */
export const createReward = async (data: RewardCreate): Promise<Reward> => {
  const response = await axiosClient.post<Reward>('/shop/rewards', data);
  return response.data;
};

/**
 * Update reward (parent)
 */
export const updateReward = async (
  rewardId: string,
  data: RewardUpdate
): Promise<Reward> => {
  const response = await axiosClient.put<Reward>(
    `/shop/rewards/${rewardId}`,
    data
  );
  return response.data;
};

/**
 * Delete reward (parent)
 */
export const deleteReward = async (rewardId: string): Promise<void> => {
  await axiosClient.delete(`/shop/rewards/${rewardId}`);
};

/**
 * Update reward quantity (parent)
 */
export const updateRewardQuantity = async (
  rewardId: string,
  delta: number
): Promise<{ id: string; remain: number }> => {
  const response = await axiosClient.patch<{ id: string; remain: number }>(
    `/shop/rewards/${rewardId}/quantity`,
    null,
    { params: { delta } }
  );
  return response.data;
};

// ============== REDEMPTION ==============

/**
 * Request reward redemption (child)
 */
export const requestRedemption = async (
  childId: string,
  rewardId: string
): Promise<{ id: string; message: string; cost: number }> => {
  const response = await axiosClient.post<{
    id: string;
    message: string;
    cost: number;
  }>(`/children/${childId}/redeem`, { reward_id: rewardId });
  return response.data;
};

/**
 * Get all redemption requests (parent)
 */
export const getRedemptionRequests = async (params?: {
  status?: RedemptionStatus;
}): Promise<RedemptionRequest[]> => {
  const response = await axiosClient.get<RedemptionRequest[]>(
    '/shop/redemption-requests',
    { params }
  );
  return response.data;
};

/**
 * Approve redemption request (parent)
 */
export const approveRedemption = async (
  requestId: string
): Promise<{ message: string; child_coins_remaining: number }> => {
  const response = await axiosClient.post<{
    message: string;
    child_coins_remaining: number;
  }>(`/shop/redemption-requests/${requestId}/approve`);
  return response.data;
};

/**
 * Reject redemption request (parent)
 */
export const rejectRedemption = async (
  requestId: string
): Promise<{ message: string }> => {
  const response = await axiosClient.post<{ message: string }>(
    `/shop/redemption-requests/${requestId}/reject`
  );
  return response.data;
};

// ============== INVENTORY ==============

/**
 * Get child's reward inventory
 */
export const getInventory = async (
  childId: string
): Promise<ChildRewardWithDetails[]> => {
  const response = await axiosClient.get<ChildRewardWithDetails[]>(
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
): Promise<{ message: string; reward_id: string }> => {
  const response = await axiosClient.post<{
    message: string;
    reward_id: string;
  }>(`/children/${childId}/avatar/equip`, null, {
    params: { reward_id: rewardId },
  });
  return response.data;
};

export default {
  // Shop
  getAllRewards,
  createReward,
  updateReward,
  deleteReward,
  updateRewardQuantity,
  
  // Redemption
  requestRedemption,
  getRedemptionRequests,
  approveRedemption,
  rejectRedemption,
  
  // Inventory
  getInventory,
  equipSkin,
};

