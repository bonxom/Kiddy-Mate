import axiosClient from '../client/axiosClient';

// ==================== TYPES ====================

export interface ChildOnboardingData {
  full_name: string;
  nickname: string;
  date_of_birth: string; // ISO format YYYY-MM-DD
  gender: string;
  favorite_topics: string[];
  discipline_autonomy: Record<string, string | null>;
  emotional_intelligence: Record<string, string | null>;
  social_interaction: Record<string, string | null>;
}

export interface OnboardingRequest {
  parent_display_name: string;
  phone_number?: string;
  children: ChildOnboardingData[];
}

export interface OnboardingResponse {
  message: string;
  children: Array<{
    id: string;
    name: string;
    nickname: string;
  }>;
}

// ==================== API CALLS ====================

/**
 * Complete onboarding process
 * Creates children and assessments in one transaction
 */
export const completeOnboarding = async (
  data: OnboardingRequest
): Promise<OnboardingResponse> => {
  const response = await axiosClient.post<OnboardingResponse>(
    '/onboarding/complete',
    data
  );
  return response.data;
};

export default {
  completeOnboarding,
};
