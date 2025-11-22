export type TaskStatus = 'assigned' | 'in-progress' | 'need-verify' | 'completed' | 'missed' | 'giveup' | 'unassigned';

export type TaskCategory = 'self-discipline' | 'logic' | 'creativity' | 'social' | 'physical' | 'academic';

export interface AssignedTask {
  id: string;
  child: string;
  task: string;
  date: string;
  status: TaskStatus;
  reward?: number;
  category?: TaskCategory;
}

export interface LibraryTask {
  id: string;
  task: string;
  category: TaskCategory;
  description: string;
  suggestedReward?: number;
  suggestedChild?: string;
}

export interface CreateTaskFormData {
  childId: string;
  taskName: string;
  reward: number;
  dueDate?: string;
}

export interface AssignTaskFormData {
  taskId: string;
  childId: string;
  taskName: string;
  reward: number;
  dueDate?: string;
}
