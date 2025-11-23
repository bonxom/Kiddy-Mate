/**
 * Child API Service
 * Handles all child-related API operations
 */

import axiosClient from '../client/axiosClient';

export interface Child {
  id: string;
  name: string;
  birth_date: string;
  nickname?: string;
  gender?: string;
  avatar_url?: string;
  personality?: string[];
  interests?: string[];
  strengths?: string[];
  challenges?: string[];
  initial_traits?: any;
  current_coins: number;
  level: number;
}

export interface CreateChildRequest {
  name: string;
  birth_date: string;
  nickname?: string;
  gender?: string;
  avatar_url?: string;
  personality?: string[];
  interests?: string[];
  strengths?: string[];
  challenges?: string[];
  initial_traits?: any;
  username?: string; // For child login account
  password?: string; // Plain password, will be hashed
  assessment?: {
    discipline_autonomy: Record<string, string>;
    emotional_intelligence: Record<string, string>;
    social_interaction: Record<string, string>;
  }; // Assessment answers for LLM analysis
}

/**
 * Get all children for current parent
 */
export const getChildren = async (): Promise<Child[]> => {
  const response = await axiosClient.get<Child[]>('/children');
  return response.data;
};

/**
 * Get single child by ID
 */
export const getChild = async (childId: string): Promise<Child> => {
  const response = await axiosClient.get<Child>(`/children/${childId}`);
  return response.data;
};

/**
 * Create new child profile
 */
export const createChild = async (data: CreateChildRequest): Promise<Child> => {
  const response = await axiosClient.post<Child>('/children', data);
  return response.data;
};

/**
 * Update child profile
 */
export const updateChild = async (
  childId: string,
  data: CreateChildRequest
): Promise<Child> => {
  const response = await axiosClient.put<Child>(`/children/${childId}`, data);
  return response.data;
};

/**
 * Delete child
 */
export const deleteChild = async (childId: string): Promise<{ message: string }> => {
  const response = await axiosClient.delete<{ message: string }>(`/children/${childId}`);
  return response.data;
};

/**
 * Select active child (for context)
 */
export const selectChild = async (childId: string): Promise<{ message: string }> => {
  const response = await axiosClient.post<{ message: string }>(
    `/children/${childId}/select`
  );
  return response.data;
};

export default {
  getChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
  selectChild,
};
