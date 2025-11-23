export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
}

export interface ChildProfile {
  id: string;
  avatar?: string;
  nickname: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  // Additional registration data from questionnaire
  personality?: string[];
  interests?: string[];
  strengths?: string[];
  challenges?: string[];
  // Assessment data for LLM analysis
  assessment?: import('./auth.types').ChildAssessment;
  username?: string;
  password?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationSettings {
  emailNotifications: {
    enabled: boolean;
    redemptionRequests: boolean;
    missedTasks: boolean;
    emotionTrends: boolean;
    weeklyReport: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    redemptionRequests: boolean;
    missedTasks: boolean;
    emotionTrends: boolean;
    weeklyReport: boolean;
  };
}
