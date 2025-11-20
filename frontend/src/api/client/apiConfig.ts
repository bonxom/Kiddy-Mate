/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Get API base URL from environment variable or use default
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    TOKEN: '/auth/token',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  
  // Children endpoints
  CHILDREN: {
    LIST: '/children/children',
    DETAIL: (childId: string) => `/children/${childId}`,
    CREATE: '/children/children',
    UPDATE: (childId: string) => `/children/${childId}`,
    DELETE: (childId: string) => `/children/${childId}`,
  },
  
  // Task endpoints
  TASKS: {
    LIST: (childId: string) => `/children/${childId}/tasks`,
    SUGGESTED: (childId: string) => `/children/${childId}/tasks/suggested`,
    START: (childId: string, taskId: string) => `/children/${childId}/tasks/${taskId}/start`,
    COMPLETE: (childId: string, childTaskId: string) => `/children/${childId}/tasks/${childTaskId}/complete`,
    VERIFY: (childId: string, childTaskId: string) => `/children/${childId}/tasks/${childTaskId}/verify`,
  },
  
  // Inventory & Rewards endpoints
  INVENTORY: {
    LIST: (childId: string) => `/children/${childId}/inventory`,
    EQUIP: (childId: string) => `/children/${childId}/avatar/equip`,
  },
  
  // Games endpoints
  GAMES: {
    LIST: (childId: string) => `/children/${childId}/games`,
    START: (childId: string, gameId: string) => `/children/${childId}/games/${gameId}/start`,
    SUBMIT: (childId: string, sessionId: string) => `/children/${childId}/games/sessions/${sessionId}/submit`,
  },
  
  // Dashboard & Reports endpoints
  DASHBOARD: {
    GET: (childId: string) => `/dashboard/${childId}`,
  },
  
  REPORTS: {
    LIST: (childId: string) => `/reports/reports/${childId}`,
    DETAIL: (childId: string, reportId: string) => `/reports/reports/${childId}/${reportId}`,
  },
  
  // Interaction endpoints
  INTERACT: {
    CHAT: (childId: string) => `/children/${childId}/interact/chat`,
  },
} as const;

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  REFRESH_TOKEN: 'refresh_token',
} as const;
