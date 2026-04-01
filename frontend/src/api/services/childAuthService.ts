import axiosClient from '../client/axiosClient';
import { childApi } from '../childApi';

// ==================== TYPES ====================

export interface ChildLoginCredentials {
  username: string;
  password: string;
}

export interface ChildLoginResponse {
  access_token: string;
  token_type: string;
  user_type: 'child';
  child_id: string;
  child_name: string;
}

// ==================== API CALLS ====================

/**
 * Child login with username and password
 */
export const loginChild = async (
  credentials: ChildLoginCredentials
): Promise<ChildLoginResponse> => {
  const response = await axiosClient.post<ChildLoginResponse>(
    childApi.auth.login,
    credentials
  );
  return response.data;
};

export default {
  loginChild,
};
