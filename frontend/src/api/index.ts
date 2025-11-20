/**
 * API Module Index
 * Main export point for API client and services
 */

// Export axios client
export { default as axiosClient, getErrorMessage } from './client/axiosClient';
export type { ApiError } from './client/axiosClient';

// Export API configuration
export { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from './client/apiConfig';

// Export all services
export * from './services';
