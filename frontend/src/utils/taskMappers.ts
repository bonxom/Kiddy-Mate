/**
 * Task Data Mappers
 * Convert between backend API responses and frontend UI models
 */

import type { ChildTaskWithDetails, ChildTaskPriority, Task } from '../api/services/taskService';
import type { LibraryTask, TaskCategory } from '../types/task.types';

// Frontend UI model for AssignedTasksTab
export interface UIAssignedTask {
  id: string;
  child: string;
  task: string;
  date: string;
  status: 'assigned' | 'in-progress' | 'need-verify' | 'completed' | 'missed';
  reward: number; // Always required, default to 0 if not provided
  category: TaskCategory;
  priority: 'high' | 'medium' | 'low';
  progress?: number;
  dueDate?: string;
  notes?: string;
}

// ============================================================================
// CATEGORY MAPPINGS (Backend ↔ Frontend)
// ============================================================================

const BACKEND_TO_FRONTEND_CATEGORY: Record<string, TaskCategory> = {
  Independence: 'self-discipline',
  Logic: 'logic',
  Physical: 'physical',
  Creativity: 'creativity',
  Social: 'social',
  Academic: 'academic',
  IQ: 'logic',        // Backward compatibility
  EQ: 'social',       // Backward compatibility
};

const FRONTEND_TO_BACKEND_CATEGORY: Record<TaskCategory, string> = {
  'self-discipline': 'Independence',
  logic: 'Logic',
  physical: 'Physical',
  creativity: 'Creativity',
  social: 'Social',
  academic: 'Academic',
};

/**
 * Map backend category to frontend category
 */
export const mapBackendCategory = (category: string): TaskCategory => {
  return BACKEND_TO_FRONTEND_CATEGORY[category] || 'self-discipline';
};

/**
 * Map frontend category to backend category
 */
export const mapToBackendCategory = (
  category: string
): import('../api/services/taskService').TaskCategory => {
  return (FRONTEND_TO_BACKEND_CATEGORY[category as TaskCategory] || 'Independence') as any;
};

// ============================================================================
// STATUS MAPPINGS (Backend ↔ Frontend)
// ============================================================================

/**
 * Map backend status to frontend status
 * Now aligned with new backend ChildTaskStatus enum
 */
const mapBackendStatus = (
  status: 'assigned' | 'in_progress' | 'need_verify' | 'completed' | 'missed' | 'giveup' | 'unassigned'
): 'assigned' | 'in-progress' | 'need-verify' | 'completed' | 'missed' | 'giveup' | 'unassigned' => {
  // Direct mapping with underscore to hyphen conversion
  return status.replace(/_/g, '-') as 'assigned' | 'in-progress' | 'need-verify' | 'completed' | 'missed' | 'giveup' | 'unassigned';
};

// ============================================================================
// PRIORITY MAPPINGS (Backend ↔ Frontend)
// ============================================================================

/**
 * Map backend priority to frontend priority
 */
const mapBackendPriority = (
  priority?: ChildTaskPriority | string
): 'high' | 'medium' | 'low' => {
  if (!priority) return 'medium';
  const priorityValue = typeof priority === 'string' ? priority.toLowerCase() : priority;
  return (priorityValue === 'high' || priorityValue === 'low') ? priorityValue : 'medium';
};

/**
 * Map frontend priority to backend priority
 */
export const mapToBackendPriority = (
  priority: 'high' | 'medium' | 'low'
): ChildTaskPriority => {
  return priority as ChildTaskPriority;
};

// ============================================================================
// TASK MAPPERS
// ============================================================================

/**
 * Map backend Task to frontend LibraryTask
 */
export const mapToLibraryTask = (backendTask: Task): LibraryTask => {
  return {
    id: backendTask.id,
    task: backendTask.title,
    category: mapBackendCategory(backendTask.category),
    description: backendTask.description || '',
    suggestedReward: backendTask.reward_coins,
    suggestedChild: undefined,
  };
};

/**
 * Map backend ChildTaskWithDetails to frontend UIAssignedTask
 */
export const mapToUIAssignedTask = (
  backendTask: ChildTaskWithDetails,
  childName: string
): UIAssignedTask => {
  // Use custom_title if available, otherwise use task.title
  const taskTitle = backendTask.custom_title || backendTask.task.title;
  
  // Use custom_reward_coins if available, otherwise use task.reward_coins
  // Fallback to 0 if both are undefined/null
  const rewardCoins = backendTask.custom_reward_coins !== undefined && backendTask.custom_reward_coins !== null
    ? backendTask.custom_reward_coins 
    : (backendTask.task.reward_coins !== undefined && backendTask.task.reward_coins !== null
      ? backendTask.task.reward_coins
      : 0);

  return {
    id: backendTask.id,
    child: childName,
    task: taskTitle,
    date: new Date(backendTask.assigned_at).toISOString().split('T')[0],
    status: mapBackendStatus(backendTask.status),
    reward: rewardCoins,
    category: mapBackendCategory(backendTask.task.category),
    priority: mapBackendPriority(backendTask.priority),
    progress: backendTask.progress,
    dueDate: backendTask.due_date
      ? backendTask.due_date.split('T')[0]  // Extract YYYY-MM-DD directly without timezone conversion
      : undefined,
    notes: backendTask.notes,
  };
};

