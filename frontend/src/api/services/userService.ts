/**
 * User Service
 * Handles all user-related API operations (profile, password, notifications)
 */

import axiosClient, { getErrorMessage } from '../client/axiosClient';
import { API_ENDPOINTS } from '../client/apiConfig';

// Request types
export interface UpdateProfileRequest {
  full_name: string;
  phone_number?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface DeleteAccountRequest {
  confirmation: string;  // "DELETE"
  password: string;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    coin_redemption: boolean;
    task_reminders: boolean;
    emotional_trends: boolean;
    weekly_reports: boolean;
  };
  push: {
    enabled: boolean;
    coin_redemption: boolean;
    task_reminders: boolean;
    emotional_trends: boolean;
    weekly_reports: boolean;
  };
}

// Response types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  onboarding_completed: boolean;
  children_count: number;
  created_at: string;
}

/**
 * Get current user profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await axiosClient.get<UserProfile>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<{ message: string; user: UserProfile }> => {
  try {
    const response = await axiosClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Change password
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Delete account
 */
export const deleteAccount = async (
  data: DeleteAccountRequest
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
      data,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const response = await axiosClient.get<NotificationSettings>(
      API_ENDPOINTS.AUTH.NOTIFICATION_SETTINGS
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (
  settings: NotificationSettings
): Promise<{ message: string; settings: NotificationSettings }> => {
  try {
    const response = await axiosClient.put(
      API_ENDPOINTS.AUTH.NOTIFICATION_SETTINGS,
      settings
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
