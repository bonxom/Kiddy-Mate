// Authentication & Onboarding Types

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
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

// Onboarding Step 1: Parent Info
export interface ParentInfo {
  displayName: string;
  phoneNumber?: string;
  numberOfChildren: number;
}

// Onboarding Step 2: Child Basic Info
export interface ChildBasicInfo {
  fullName: string;
  nickname?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  favoriteTopics: string[]; // Tags they love
}

// Onboarding Step 3: Assessment Questionnaire
export type AssessmentCategory = 'discipline' | 'emotional' | 'social';

export interface AssessmentQuestion {
  id: string;
  category: AssessmentCategory;
  question: string;
  description?: string;
}

export interface AssessmentAnswer {
  questionId: string;
  rating: 1 | 2 | 3 | 4 | 5; // 5-point scale
}

export interface ChildAssessment {
  childId?: string; // Optional for new registration
  answers: AssessmentAnswer[];
}

// Complete Onboarding Data
export interface OnboardingData {
  parentInfo: ParentInfo;
  children: Array<{
    basicInfo: ChildBasicInfo;
    assessment: ChildAssessment;
  }>;
}

// Onboarding State Management
export type OnboardingStep = 
  | 'parent-info'      // Step 1
  | 'child-info'       // Step 2
  | 'assessment';      // Step 3

export interface OnboardingState {
  currentStep: OnboardingStep;
  currentChildIndex: number;
  data: OnboardingData;
  isComplete: boolean;
}
