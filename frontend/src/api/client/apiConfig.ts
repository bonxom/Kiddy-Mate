/**
 * API Configuration
 * Centralized configuration for API runtime settings and endpoint namespaces
 */

import { childApi } from '../childApi';
import { parentApi } from '../parentApi';

// Get API base URL from environment variable or use default
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Central endpoint exports
export const API_ENDPOINTS = {
  PARENT: parentApi,
  CHILD: childApi,
  // Backward-compatible alias for older auth services.
  AUTH: {
    REGISTER: parentApi.auth.register,
    LOGIN: parentApi.auth.login,
    TOKEN: parentApi.auth.token,
    ME: parentApi.auth.me,
    UPDATE_PROFILE: parentApi.auth.updateProfile,
    CHANGE_PASSWORD: parentApi.auth.changePassword,
    DELETE_ACCOUNT: parentApi.auth.deleteAccount,
    NOTIFICATION_SETTINGS: parentApi.auth.notificationSettings,
    LOGOUT: parentApi.auth.logout,
  },
} as const;

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  REFRESH_TOKEN: 'refresh_token',
  LANGUAGE: 'app_language',
} as const;
