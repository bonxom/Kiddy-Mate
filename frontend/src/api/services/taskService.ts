/**
 * Task API Service
 * Handles all task-related API operations
 */

import axiosClient from '../client/axiosClient';

// Updated to match backend TaskCategory enum (6 categories + backward compatibility)
export type TaskCategory = 
  | 'Independence' 
  | 'Logic' 
  | 'Physical' 
  | 'Creativity' 
  | 'Social' 
  | 'Academic'
  | 'IQ'  // Backward compatibility
  | 'EQ'; // Backward compatibility

export type TaskType = 'logic' | 'emotion'; // Match backend TaskType
export type ChildTaskStatus = 'suggested' | 'in_progress' | 'completed' | 'verified';

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

export interface ChildTask {
  id: string;
  status: ChildTaskStatus;
  assigned_at: string;
  completed_at?: string;
}

export interface ChildTaskWithDetails extends ChildTask {
  task: Task;
}

export interface GetChildTasksParams {
  limit?: number;
  category?: string;
  status?: ChildTaskStatus;
}

/**
 * Get all available tasks in library
 */
export const getAllTasks = async (): Promise<Task[]> => {
  const response = await axiosClient.get<Task[]>('/tasks');
  return response.data;
};

/**
 * Get suggested tasks for child (max 5)
 */
export const getSuggestedTasks = async (childId: string): Promise<Task[]> => {
  const response = await axiosClient.get<Task[]>(
    `/children/${childId}/tasks/suggested`
  );
  return response.data;
};

/**
 * Get child's assigned tasks with full details (ENHANCED)
 * Backend now returns full task details populated
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
 * Start/assign a task to child
 */
export const startTask = async (
  childId: string,
  taskId: string
): Promise<ChildTask> => {
  const response = await axiosClient.post<ChildTask>(
    `/children/${childId}/tasks/${taskId}/start`
  );
  return response.data;
};

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
  getAllTasks,
  getSuggestedTasks,
  getChildTasks,
  startTask,
  completeTask,
  verifyTask,
};
