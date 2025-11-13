export type RedemptionStatus = 'pending' | 'approved' | 'rejected';

export interface Reward {
  id: string;
  url_thumbnail: string;
  name: string;
  cost: number;
  remain: number;
  description?: string;
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

export interface RewardFormData {
  url_thumbnail: string;
  name: string;
  cost: number;
  remain: number;
  description: string;
}
