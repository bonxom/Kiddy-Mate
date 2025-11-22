import axiosClient from '../client/axiosClient';

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
    '/auth/child/login',
    credentials
  );
  return response.data;
};

export default {
  loginChild,
};
