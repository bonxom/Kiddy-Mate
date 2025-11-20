/**
 * Task API Service
 * Handles all task-related API operations
 */

import axiosClient from '../client/axiosClient';

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
export type ChildTaskStatus = 'suggested' | 'in_progress' | 'completed' | 'verified';
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
  task: Task;
}

export interface ChildTaskUpdate {
  priority?: ChildTaskPriority;
  due_date?: string;
  progress?: number;
  notes?: string;
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
  const response = await axiosClient.get<Task[]>('/tasks');
  return response.data;
};

/**
 * Create custom task
 */
export const createTask = async (task: TaskCreate): Promise<Task> => {
  const response = await axiosClient.post<Task>('/tasks', task);
  return response.data;
};

/**
 * Update task details
 */
export const updateTask = async (taskId: string, task: TaskUpdate): Promise<Task> => {
  const response = await axiosClient.put<Task>(`/tasks/${taskId}`, task);
  return response.data;
};

/**
 * Delete task from library (cascade delete assigned tasks)
 */
export const deleteTask = async (taskId: string): Promise<{ message: string }> => {
  const response = await axiosClient.delete<{ message: string }>(`/tasks/${taskId}`);
  return response.data;
};

// ============================================================================
// TASK SUGGESTIONS
// ============================================================================

/**
 * Get suggested tasks for child (max 5, excludes already assigned)
 */
export const getSuggestedTasks = async (childId: string): Promise<Task[]> => {
  const response = await axiosClient.get<Task[]>(
    `/children/${childId}/tasks/suggested`
  );
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
    `/children/${childId}/tasks`,
    { params }
  );
  return response.data;
};

/**
 * Assign task to child
 */
export const assignTask = async (
  childId: string,
  taskId: string
): Promise<ChildTask> => {
  const response = await axiosClient.post<ChildTask>(
    `/children/${childId}/tasks/${taskId}/start`
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
    `/children/${childId}/tasks/${childTaskId}`,
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
    `/children/${childId}/tasks/${childTaskId}`
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
    `/children/${childId}/tasks/${childTaskId}/complete`
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
    `/children/${childId}/tasks/${childTaskId}/verify`
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
  updateAssignedTask,
  unassignTask,
  
  // Lifecycle
  completeTask,
  verifyTask,
};
