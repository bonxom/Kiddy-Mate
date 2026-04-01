/**
 * Task API Service
 * Handles all task-related API operations
 */

import axiosClient from '../client/axiosClient';
import { parentApi } from '../parentApi';

// Updated to match backend TaskCategory enum (8 categories)
export type TaskCategory =
  | 'Independence'
  | 'Logic'
  | 'Physical'
  | 'Creativity'
  | 'Social'
  | 'Academic'
  | 'IQ'  // Backward compatibility
  | 'EQ'; // Backward compatibility

export type TaskType = 'logic' | 'emotion';
export type ChildTaskStatus = 'assigned' | 'in_progress' | 'need_verify' | 'completed' | 'missed' | 'giveup' | 'unassigned';
export type ChildTaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  type: TaskType;
  difficulty: number;
  suggested_age_range: string;
  reward_coins: number;
  reward_badge_name?: string;
  unity_type?: string;
}

export interface TaskCreate {
  title: string;
  description: string;
  category: TaskCategory;
  type: TaskType;
  difficulty: number;
  suggested_age_range: string;
  reward_coins?: number;
  reward_badge_name?: string;
}

export interface CreateAndAssignTaskRequest {
  title: string;
  description?: string;
  category: TaskCategory;
  type: TaskType;
  difficulty: number;
  suggested_age_range: string;
  reward_coins: number;
  reward_badge_name?: string;
  // Assignment params
  due_date?: string;
  priority?: ChildTaskPriority;
  notes?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  category?: TaskCategory;
  type?: TaskType;
  difficulty?: number;
  suggested_age_range?: string;
  reward_coins?: number;
  reward_badge_name?: string;
}

export interface ChildTask {
  id: string;
  status: ChildTaskStatus;
  assigned_at: string;
  completed_at?: string;
}

export interface ChildTaskWithDetails extends ChildTask {
  priority?: ChildTaskPriority;
  due_date?: string;
  progress?: number;
  notes?: string;
  custom_title?: string;
  custom_reward_coins?: number;
  custom_category?: TaskCategory;
  unity_type?: string;
  task: Task;
}

export interface ChildTaskUpdate {
  priority?: ChildTaskPriority;
  due_date?: string;
  progress?: number;
  notes?: string;
  custom_title?: string;
  custom_reward_coins?: number;
  custom_category?: TaskCategory;
}

export interface GetChildTasksParams {
  limit?: number;
  category?: string;
  status?: ChildTaskStatus;
}

// ============================================================================
// TASK LIBRARY MANAGEMENT
// ============================================================================

/**
 * Get all available tasks in library
 */
export const getAllTasks = async (): Promise<Task[]> => {
  const response = await axiosClient.get<Task[]>(parentApi.taskLibrary.list);
  return response.data;
};

/**
 * Create custom task
 */
export const createTask = async (task: TaskCreate): Promise<Task> => {
  const response = await axiosClient.post<Task>(parentApi.taskLibrary.create, task);
  return response.data;
};

/**
 * Update task details
 */
export const updateTask = async (taskId: string, task: TaskUpdate): Promise<Task> => {
  const response = await axiosClient.put<Task>(parentApi.taskLibrary.update(taskId), task);
  return response.data;
};

/**
 * Delete task from library (cascade delete assigned tasks)
 */
export const deleteTask = async (taskId: string): Promise<{ message: string }> => {
  const response = await axiosClient.delete<{ message: string }>(parentApi.taskLibrary.delete(taskId));
  return response.data;
};

// ============================================================================
// TASK SUGGESTIONS
// ============================================================================

/**
 * Get suggested tasks for child (max 5, excludes already assigned)
 */
export const getSuggestedTasks = async (childId: string): Promise<Task[]> => {
  const response = await axiosClient.get<Task[]>(parentApi.childTasks.suggested(childId));
  return response.data;
};

// ============================================================================
// ASSIGNED TASKS MANAGEMENT
// ============================================================================

/**
 * Get child's assigned tasks with full details (supports filtering)
 */
export const getChildTasks = async (
  childId: string,
  params?: GetChildTasksParams
): Promise<ChildTaskWithDetails[]> => {
  const response = await axiosClient.get<ChildTaskWithDetails[]>(
    parentApi.childTasks.list(childId),
    { params }
  );
  return response.data;
};

/**
 * Assign task to child with optional parameters
 */
export const assignTask = async (
  childId: string,
  taskId: string,
  params?: {
    due_date?: string;
    priority?: ChildTaskPriority;
    notes?: string;
    custom_title?: string;
    custom_reward_coins?: number;
    custom_category?: TaskCategory;
  }
): Promise<ChildTaskWithDetails> => {
  const response = await axiosClient.post<ChildTaskWithDetails>(
    parentApi.childTasks.assign(childId, taskId),
    params || {}
  );
  return response.data;
};

/**
 * Create and assign task in one step
 */
export const createAndAssignTask = async (
  childId: string,
  request: CreateAndAssignTaskRequest
): Promise<ChildTaskWithDetails> => {
  const response = await axiosClient.post<ChildTaskWithDetails>(
    parentApi.childTasks.createAndAssign(childId),
    request
  );
  return response.data;
};

/**
 * Update assigned task (priority, due_date, progress, notes)
 */
export const updateAssignedTask = async (
  childId: string,
  childTaskId: string,
  updates: ChildTaskUpdate
): Promise<ChildTaskWithDetails> => {
  const response = await axiosClient.put<ChildTaskWithDetails>(
    parentApi.childTasks.update(childId, childTaskId),
    updates
  );
  return response.data;
};

/**
 * Unassign task from child
 */
export const unassignTask = async (
  childId: string,
  childTaskId: string
): Promise<{ message: string }> => {
  const response = await axiosClient.delete<{ message: string }>(
    parentApi.childTasks.delete(childId, childTaskId)
  );
  return response.data;
};

// ============================================================================
// TASK LIFECYCLE ACTIONS
// ============================================================================

/**
 * Mark task as completed (waiting for verification)
 */
export const completeTask = async (
  childId: string,
  childTaskId: string
): Promise<{ message: string }> => {
  const response = await axiosClient.post<{ message: string }>(
    parentApi.childTasks.complete(childId, childTaskId)
  );
  return response.data;
};

/**
 * Verify completed task (award coins & badge)
 */
export const verifyTask = async (
  childId: string,
  childTaskId: string
): Promise<{ message: string }> => {
  const response = await axiosClient.post<{ message: string }>(
    parentApi.childTasks.verify(childId, childTaskId)
  );
  return response.data;
};

/**
 * Reject task verification (return task to in-progress)
 */
export const rejectTaskVerification = async (
  childId: string,
  childTaskId: string
): Promise<{ message: string }> => {
  const response = await axiosClient.post<{ message: string }>(
    parentApi.childTasks.reject(childId, childTaskId)
  );
  return response.data;
};

/**
 * Check task status
 */
export const checkTaskStatus = async (
  childId: string,
  taskId: string
): Promise<{ status: ChildTaskStatus }> => {
  const response = await axiosClient.get<{ status: ChildTaskStatus }>(
    parentApi.childTasks.status(childId, taskId)
  );
  return response.data;
};

/**
 * Give up on a task (change status to 'giveup')
 */
export const giveupTask = async (
  childId: string,
  taskId: string
): Promise<{ message: string; status: string }> => {
  const response = await axiosClient.post<{ message: string; status: string }>(
    parentApi.childTasks.giveup(childId, taskId)
  );
  return response.data;
};

/**
 * Get unassigned tasks (tasks generated but not yet assigned)
 */
export const getUnassignedTasks = async (
  childId: string,
  category?: TaskCategory
): Promise<ChildTaskWithDetails[]> => {
  const response = await axiosClient.post<ChildTaskWithDetails[]>(
    parentApi.childTasks.unassigned(childId),
    {},
    { params: category ? { category } : undefined }
  );
  return response.data;
};

/**
 * Get tasks that were given up
 */
export const getGiveupTasks = async (
  childId: string,
  category?: TaskCategory
): Promise<ChildTaskWithDetails[]> => {
  const response = await axiosClient.post<ChildTaskWithDetails[]>(
    parentApi.childTasks.giveupList(childId),
    {},
    { params: category ? { category } : undefined }
  );
  return response.data;
};

/**
 * Get completed tasks
 */
export const getCompletedTasks = async (
  childId: string,
  limit?: number
): Promise<ChildTaskWithDetails[]> => {
  const response = await axiosClient.get<ChildTaskWithDetails[]>(
    parentApi.childTasks.completed(childId),
    { params: limit ? { limit } : undefined }
  );
  return response.data;
};

export default {
  // Library Management
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,

  // Suggestions
  getSuggestedTasks,

  // Assigned Tasks
  getChildTasks,
  assignTask,
  createAndAssignTask,
  updateAssignedTask,
  unassignTask,

  // Lifecycle
  completeTask,
  verifyTask,
  checkTaskStatus,
  giveupTask,
  
  // Task Lists
  getUnassignedTasks,
  getGiveupTasks,
  getCompletedTasks,
};
