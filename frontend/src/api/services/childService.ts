/**
 * Child API Service
 * Handles all child-related API operations
 */

import axiosClient from '../client/axiosClient';

export interface Child {
  id: string;
  name: string;
  birth_date: string;
  initial_traits?: string;
  current_coins: number;
  level: number;
}

export interface CreateChildRequest {
  name: string;
  birth_date: string;
  initial_traits?: string;
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
  selectChild,
};
