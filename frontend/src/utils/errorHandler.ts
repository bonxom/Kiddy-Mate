/**
 * Centralized Error Handler
 * Provides consistent error handling across the application
 */

import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/client/axiosClient';

/**
 * Handle API errors with toast notifications
 * @param error - The error object from API call
 * @param customMessage - Optional custom message to display
 * @returns The error message string
 */
export const handleApiError = (error: unknown, customMessage?: string): string => {
    const message = customMessage || getErrorMessage(error);

    // Show toast notification
    toast.error(message, {
        duration: 5000,
        icon: '⚠️',
    });

    // Log to console in development
    if (import.meta.env.DEV) {
        console.error('API Error:', error);
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // trackError(error, { customMessage });

    return message;
};

/**
 * Handle success messages with toast
 * @param message - Success message to display
 */
export const showSuccess = (message: string) => {
    toast.success(message, {
        duration: 3000,
        icon: '✅',
    });
};

/**
 * Handle info messages with toast
 * @param message - Info message to display
 */
export const showInfo = (message: string) => {
    toast(message, {
        duration: 3000,
        icon: 'ℹ️',
    });
};

/**
 * Handle warning messages with toast
 * @param message - Warning message to display
 */
export const showWarning = (message: string) => {
    toast(message, {
        duration: 4000,
        icon: '⚠️',
        style: {
            border: '1px solid #f59e0b',
        },
    });
};

/**
 * Show loading toast
 * @param message - Loading message
 * @returns Toast ID for dismissing later
 */
export const showLoading = (message: string = 'Loading...') => {
    return toast.loading(message);
};

/**
 * Dismiss a specific toast or all toasts
 * @param toastId - Optional toast ID to dismiss specific toast
 */
export const dismissToast = (toastId?: string) => {
    if (toastId) {
        toast.dismiss(toastId);
    } else {
        toast.dismiss();
    }
};

export default {
    error: handleApiError,
    success: showSuccess,
    info: showInfo,
    warning: showWarning,
    loading: showLoading,
    dismiss: dismissToast,
};
