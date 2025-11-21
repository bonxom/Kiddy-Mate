/**
 * Task Configuration Constants
 * Centralized configuration for task categories, priorities, and statuses
 * Used across TaskCenter components to eliminate duplicate code
 */

import { 
  Target, 
  Brain, 
  Dumbbell, 
  Palette, 
  Users, 
  BookOpen,
  AlertCircle,
  TrendingUp,
  Minus,
  type LucideIcon
} from 'lucide-react';
import type { TaskCategory, TaskStatus } from '../types/task.types';

// ============================================================================
// TASK CATEGORY CONFIGURATION
// ============================================================================

export type TaskCategoryKey = 'self-discipline' | 'logic' | 'creativity' | 'social' | 'physical' | 'academic';

export const TASK_CATEGORY_LABELS: Record<TaskCategoryKey, string> = {
  'self-discipline': 'Independence',
  logic: 'Logic',
  creativity: 'Creativity',
  social: 'Social',
  physical: 'Physical',
  academic: 'Academic',
};

export const TASK_CATEGORY_ICONS: Record<TaskCategoryKey, LucideIcon> = {
  'self-discipline': Target,
  logic: Brain,
  physical: Dumbbell,
  creativity: Palette,
  social: Users,
  academic: BookOpen,
};

export const TASK_CATEGORY_COLORS: Record<TaskCategoryKey, string> = {
  'self-discipline': 'text-blue-600 bg-blue-50 border-blue-200',
  logic: 'text-purple-600 bg-purple-50 border-purple-200',
  physical: 'text-green-600 bg-green-50 border-green-200',
  creativity: 'text-pink-600 bg-pink-50 border-pink-200',
  social: 'text-orange-600 bg-orange-50 border-orange-200',
  academic: 'text-indigo-600 bg-indigo-50 border-indigo-200',
};

// ============================================================================
// TASK PRIORITY CONFIGURATION
// ============================================================================

export type TaskPriorityKey = 'high' | 'medium' | 'low';

export interface PriorityConfig {
  icon: LucideIcon;
  color: string;
  label: string;
}

export const TASK_PRIORITY_CONFIG: Record<TaskPriorityKey, PriorityConfig> = {
  high: {
    icon: AlertCircle,
    color: 'text-red-600 bg-red-50 border-red-200',
    label: 'High',
  },
  medium: {
    icon: TrendingUp,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    label: 'Medium',
  },
  low: {
    icon: Minus,
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    label: 'Low',
  },
};

// ============================================================================
// TASK STATUS CONFIGURATION
// ============================================================================

export type BadgeVariant = 'info' | 'warning' | 'success' | 'danger' | 'default';

export interface StatusConfig {
  variant: BadgeVariant;
  label: string;
}

export const TASK_STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  assigned: { variant: 'info', label: 'Assigned' },
  'in-progress': { variant: 'warning', label: 'In Progress' },
  'need-verify': { variant: 'default', label: 'Need Verify' },
  completed: { variant: 'success', label: 'Completed' },
  missed: { variant: 'danger', label: 'Missed' },
};

// ============================================================================
// PROGRESS BAR GRADIENT COLORS
// ============================================================================

export const TASK_PROGRESS_GRADIENTS = {
  completed: 'linear-gradient(to right, #10b981, #059669)',
  inProgress: 'linear-gradient(to right, #3b82f6, #2563eb)',
  default: 'linear-gradient(to right, #94a3b8, #64748b)',
} as const;

// ============================================================================
// ICON SIZE CONSTANTS
// ============================================================================

export const ICON_SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get complete category configuration (icon, color, label)
 */
export function getCategoryConfig(category: TaskCategory) {
  return {
    icon: TASK_CATEGORY_ICONS[category],
    color: TASK_CATEGORY_COLORS[category],
    label: TASK_CATEGORY_LABELS[category],
  };
}

/**
 * Get priority configuration
 */
export function getPriorityConfig(priority: TaskPriorityKey) {
  return TASK_PRIORITY_CONFIG[priority];
}

/**
 * Get status configuration
 */
export function getStatusConfig(status: TaskStatus) {
  return TASK_STATUS_CONFIG[status];
}

/**
 * Get progress bar gradient based on task status
 */
export function getProgressGradient(status: TaskStatus, progress: number): string {
  if (progress === 100 || status === 'completed') {
    return TASK_PROGRESS_GRADIENTS.completed;
  }
  if (status === 'in-progress') {
    return TASK_PROGRESS_GRADIENTS.inProgress;
  }
  return TASK_PROGRESS_GRADIENTS.default;
}
