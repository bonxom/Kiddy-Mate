/**
 * Task Data Mappers
 * Convert between backend API responses and frontend UI models
 */

import type { ChildTaskWithDetails, ChildTaskPriority, Task } from '../api/services/taskService';
import type { LibraryTask } from '../types/task.types';

// Frontend UI model for AssignedTasksTab
export interface UIAssignedTask {
  id: string;
  child: string;
  task: string;
  date: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'missed';
  reward: number;
  category: 'self-discipline' | 'logic' | 'creativity' | 'social' | 'physical' | 'academic';
  priority: 'high' | 'medium' | 'low';
  progress?: number;
  dueDate?: string;
  notes?: string;
}

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
    // These fields don't exist in backend Task model
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
  return {
    id: backendTask.id,
    child: childName,
    task: backendTask.task.title,
    date: new Date(backendTask.assigned_at).toISOString().split('T')[0],
    status: mapBackendStatus(backendTask.status),
    reward: backendTask.task.reward_coins,
    category: mapBackendCategory(backendTask.task.category),
    priority: mapBackendPriority(backendTask.priority),
    progress: backendTask.progress,
    dueDate: backendTask.due_date
      ? new Date(backendTask.due_date).toISOString().split('T')[0]
      : undefined,
    notes: backendTask.notes,
  };
};

/**
 * Map backend status to frontend status
 */
const mapBackendStatus = (
  status: 'suggested' | 'in_progress' | 'completed' | 'verified'
): 'assigned' | 'in-progress' | 'completed' | 'missed' => {
  switch (status) {
    case 'suggested':
      return 'assigned';
    case 'in_progress':
      return 'in-progress';
    case 'completed':
    case 'verified':
      return 'completed';
    default:
      return 'assigned';
  }
};

/**
 * Map backend category to frontend category
 */
const mapBackendCategory = (
  category: string
): 'self-discipline' | 'logic' | 'creativity' | 'social' | 'physical' | 'academic' => {
  const categoryMap: Record<string, any> = {
    Independence: 'self-discipline',
    Logic: 'logic',
    Physical: 'physical',
    Creativity: 'creativity',
    Social: 'social',
    Academic: 'academic',
    IQ: 'logic',
    EQ: 'social',
  };
  return categoryMap[category] || 'self-discipline';
};

/**
 * Map backend priority to frontend priority
 */
const mapBackendPriority = (
  priority?: ChildTaskPriority | string
): 'high' | 'medium' | 'low' => {
  if (!priority) return 'medium';
  
  const priorityValue = typeof priority === 'string' ? priority : priority;
  switch (priorityValue.toLowerCase()) {
    case 'high':
      return 'high';
    case 'low':
      return 'low';
    default:
      return 'medium';
  }
};

/**
 * Map frontend priority to backend priority
 */
export const mapToBackendPriority = (
  priority: 'high' | 'medium' | 'low'
): ChildTaskPriority => {
  switch (priority) {
    case 'high':
      return 'high';
    case 'low':
      return 'low';
    default:
      return 'medium';
  }
};

/**
 * Map frontend category to backend category
 */
export const mapToBackendCategory = (
  category: string
): import('../api/services/taskService').TaskCategory => {
  const categoryMap: Record<string, import('../api/services/taskService').TaskCategory> = {
    'self-discipline': 'Independence',
    logic: 'Logic',
    physical: 'Physical',
    creativity: 'Creativity',
    social: 'Social',
    academic: 'Academic',
  };
  return categoryMap[category] || 'Independence';
};
