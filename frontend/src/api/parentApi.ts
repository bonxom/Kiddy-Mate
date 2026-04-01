const PARENT_API_PREFIX = '/parent';

export const parentApi = {
  auth: {
    register: `${PARENT_API_PREFIX}/auth/register`,
    login: `${PARENT_API_PREFIX}/auth/login`,
    token: `${PARENT_API_PREFIX}/auth/token`,
    me: `${PARENT_API_PREFIX}/auth/me`,
    updateProfile: `${PARENT_API_PREFIX}/auth/me`,
    changePassword: `${PARENT_API_PREFIX}/auth/me/password`,
    deleteAccount: `${PARENT_API_PREFIX}/auth/me`,
    notificationSettings: `${PARENT_API_PREFIX}/auth/me/notification-settings`,
    logout: `${PARENT_API_PREFIX}/auth/logout`,
  },

  onboarding: {
    complete: `${PARENT_API_PREFIX}/onboarding/complete`,
  },

  children: {
    list: `${PARENT_API_PREFIX}/children`,
    create: `${PARENT_API_PREFIX}/children`,
    detail: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}`,
    update: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}`,
    delete: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}`,
    select: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/select`,
  },

  assessments: {
    list: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/assessments`,
    create: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/assessments`,
    createSimple: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/assessments/simple`,
    detail: (childId: string, assessmentId: string) =>
      `${PARENT_API_PREFIX}/children/${childId}/assessments/${assessmentId}`,
    update: (childId: string, assessmentId: string) =>
      `${PARENT_API_PREFIX}/children/${childId}/assessments/${assessmentId}`,
  },

  taskLibrary: {
    list: `${PARENT_API_PREFIX}/tasks`,
    create: `${PARENT_API_PREFIX}/tasks`,
    update: (taskId: string) => `${PARENT_API_PREFIX}/tasks/${taskId}`,
    delete: (taskId: string) => `${PARENT_API_PREFIX}/tasks/${taskId}`,
  },

  childTasks: {
    suggested: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/tasks/suggested`,
    list: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/tasks`,
    start: (childId: string, taskId: string) =>
      `${PARENT_API_PREFIX}/children/${childId}/tasks/${taskId}/start`,
    assign: (childId: string, taskId: string) =>
      `${PARENT_API_PREFIX}/children/${childId}/tasks/${taskId}/assign`,
    createAndAssign: (childId: string) =>
      `${PARENT_API_PREFIX}/children/${childId}/tasks/create-and-assign`,
    update: (childId: string, childTaskId: string) =>
      `${PARENT_API_PREFIX}/children/${childId}/tasks/${childTaskId}`,
    delete: (childId: string, childTaskId: string) =>
      `${PARENT_API_PREFIX}/children/${childId}/tasks/${childTaskId}`,
    complete: (childId: string, childTaskId: string) =>
      `${PARENT_API_PREFIX}/children/${childId}/tasks/${childTaskId}/complete`,
    verify: (childId: string, childTaskId: string) =>
      `${PARENT_API_PREFIX}/children/${childId}/tasks/${childTaskId}/verify`,
    reject: (childId: string, childTaskId: string) =>
      `${PARENT_API_PREFIX}/children/${childId}/tasks/${childTaskId}/reject`,
    status: (childId: string, taskId: string) =>
      `${PARENT_API_PREFIX}/children/${childId}/tasks/${taskId}/status`,
    giveup: (childId: string, taskId: string) =>
      `${PARENT_API_PREFIX}/children/${childId}/tasks/${taskId}/giveup`,
    unassigned: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/tasks/unassigned`,
    giveupList: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/tasks/giveup`,
    completed: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/tasks/completed`,
  },

  interactions: {
    chat: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/interact/chat`,
    logs: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/interact/logs`,
    history: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/interact/history`,
  },

  reports: {
    list: (childId: string) => `${PARENT_API_PREFIX}/reports/${childId}`,
    detail: (childId: string, reportId: string) => `${PARENT_API_PREFIX}/reports/${childId}/${reportId}`,
    generate: (childId: string) => `${PARENT_API_PREFIX}/reports/${childId}/generate`,
  },

  dashboard: {
    get: (childId: string) => `${PARENT_API_PREFIX}/dashboard/${childId}`,
    categoryProgress: (childId: string) => `${PARENT_API_PREFIX}/dashboard/${childId}/category-progress`,
    emotionAnalytics: (childId: string) => `${PARENT_API_PREFIX}/dashboard/${childId}/emotion-analytics`,
    analyzeEmotionReport: (childId: string) =>
      `${PARENT_API_PREFIX}/dashboard/${childId}/analyze-emotion-report`,
    updateSkills: (childId: string) => `${PARENT_API_PREFIX}/dashboard/${childId}/update-skills`,
  },

  shop: {
    rewards: `${PARENT_API_PREFIX}/shop/rewards`,
    reward: (rewardId: string) => `${PARENT_API_PREFIX}/shop/rewards/${rewardId}`,
    rewardQuantity: (rewardId: string) => `${PARENT_API_PREFIX}/shop/rewards/${rewardId}/quantity`,
    redemptionRequests: `${PARENT_API_PREFIX}/shop/redemption-requests`,
    approveRedemption: (requestId: string) =>
      `${PARENT_API_PREFIX}/shop/redemption-requests/${requestId}/approve`,
    rejectRedemption: (requestId: string) =>
      `${PARENT_API_PREFIX}/shop/redemption-requests/${requestId}/reject`,
  },

  childRewards: {
    redeem: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/redeem`,
    inventory: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/inventory`,
    equipAvatar: (childId: string) => `${PARENT_API_PREFIX}/children/${childId}/avatar/equip`,
  },
} as const;

export type ParentApi = typeof parentApi;
