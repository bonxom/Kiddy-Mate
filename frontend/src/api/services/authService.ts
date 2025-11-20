/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import axiosClient, { getErrorMessage } from '../client/axiosClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../client/apiConfig';

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

// Response types
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    role: 'parent' | 'child';
    hasCompletedOnboarding: boolean;
  };
}

/**
 * Register a new user
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    // Call register endpoint
    const response = await axiosClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );

    console.log('Registration response:', response.data);

    // After successful registration, login to get token
    const loginResponse = await login({
      email: data.email,
      password: data.password,
    });

    return loginResponse;
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Login user and get access token
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    // Call login endpoint
    const response = await axiosClient.post<TokenResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    const { access_token } = response.data;

    // Store token in localStorage
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token);

    // Get user info
    const userInfo = await getCurrentUser();

    // Transform to AuthResponse format
    const authResponse: AuthResponse = {
      token: access_token,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        displayName: userInfo.full_name,
        role: 'parent', // Default role for now
        hasCompletedOnboarding: false, // TODO: Get from backend
      },
    };

    // Store user info
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(authResponse.user));

    return authResponse;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get current user information
 */
export const getCurrentUser = async (): Promise<UserResponse> => {
  try {
    const response = await axiosClient.get<UserResponse>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  } catch (error) {
    console.error('Get user error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Logout user - call API and clear local storage
 */
export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint to invalidate session on server
    await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue with local logout even if API fails
  } finally {
    // Clear local storage
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return !!token;
};

/**
 * Get stored token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Get stored user
 */
export const getStoredUser = (): AuthResponse['user'] | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};
