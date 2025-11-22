/**
 * Custom hooks for Task Management
 * Provides data fetching and mutations for tasks
 */

import { useState, useCallback, useEffect } from 'react';
import { TaskEvents } from '../utils/events';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getSuggestedTasks,
  getChildTasks,
  assignTask,
  updateAssignedTask,
  unassignTask,
  completeTask,
  verifyTask,
  giveupTask,
  checkTaskStatus,
  getUnassignedTasks,
  getGiveupTasks,
  getCompletedTasks,
} from '../api/services/taskService';
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  ChildTaskWithDetails,
  ChildTaskUpdate,
  GetChildTasksParams,
} from '../api/services/taskService';

// ============================================================================
// TASK LIBRARY HOOKS
// ============================================================================

export const useTaskLibrary = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTasks();
      setTasks(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewTask = useCallback(async (task: TaskCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newTask = await createTask(task);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExistingTask = useCallback(async (taskId: string, updates: TaskUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await updateTask(taskId, updates);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );
      // Emit event for cross-tab sync
      TaskEvents.emit(TaskEvents.LIBRARY_UPDATED, { taskId });
      return updatedTask;
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExistingTask = useCallback(async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      // Emit event for cross-tab sync
      TaskEvents.emit(TaskEvents.TASK_DELETED, { taskId });
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask: createNewTask,
    updateTask: updateExistingTask,
    deleteTask: deleteExistingTask,
  };
};

// ============================================================================
// ASSIGNED TASKS HOOKS
// ============================================================================

export const useAssignedTasks = (childId: string) => {
  const [tasks, setTasks] = useState<ChildTaskWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(
    async (params?: GetChildTasksParams) => {
      if (!childId) return [];

      setLoading(true);
      setError(null);
      try {
        const data = await getChildTasks(childId, params);
        setTasks(data);
        return data;
      } catch (err: any) {
        setError(err.message || 'Failed to fetch assigned tasks');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [childId]
  );

  // Auto-fetch tasks when childId changes
  useEffect(() => {
    if (childId) {
      fetchTasks();
    }
  }, [childId, fetchTasks]);

  const assignNewTask = useCallback(
    async (
      taskId: string,
      params?: {
        due_date?: string;
        priority?: 'high' | 'medium' | 'low';
        notes?: string;
      }
    ) => {
      if (!childId) throw new Error('Child ID is required');

      setLoading(true);
      setError(null);
      try {
        await assignTask(childId, taskId, params);
        // Refresh tasks after assignment
        await fetchTasks();
      } catch (err: any) {
        setError(err.message || 'Failed to assign task');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [childId, fetchTasks]
  );

  const updateTask = useCallback(
    async (childTaskId: string, updates: ChildTaskUpdate) => {
      if (!childId) throw new Error('Child ID is required');

      setLoading(true);
      setError(null);
      try {
        const updatedTask = await updateAssignedTask(childId, childTaskId, updates);
        setTasks((prev) =>
          prev.map((t) => (t.id === childTaskId ? updatedTask : t))
        );
        return updatedTask;
      } catch (err: any) {
        setError(err.message || 'Failed to update assigned task');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [childId]
  );

  const unassign = useCallback(
    async (childTaskId: string) => {
      if (!childId) throw new Error('Child ID is required');

      setLoading(true);
      setError(null);
      try {
        await unassignTask(childId, childTaskId);
        setTasks((prev) => prev.filter((t) => t.id !== childTaskId));
      } catch (err: any) {
        setError(err.message || 'Failed to unassign task');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [childId]
  );

  const markComplete = useCallback(
    async (childTaskId: string) => {
      if (!childId) throw new Error('Child ID is required');

      setLoading(true);
      setError(null);
      try {
        await completeTask(childId, childTaskId);
        // Refresh tasks to get updated status
        await fetchTasks();
      } catch (err: any) {
        setError(err.message || 'Failed to complete task');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [childId, fetchTasks]
  );

  const verify = useCallback(
    async (childTaskId: string) => {
      if (!childId) throw new Error('Child ID is required');

      setLoading(true);
      setError(null);
      try {
        await verifyTask(childId, childTaskId);
        // Refresh tasks to get updated status
        await fetchTasks();
      } catch (err: any) {
        setError(err.message || 'Failed to verify task');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [childId, fetchTasks]
  );

  const giveup = useCallback(
    async (childTaskId: string) => {
      if (!childId) throw new Error('Child ID is required');

      setLoading(true);
      setError(null);
      try {
        await giveupTask(childId, childTaskId);
        // Refresh tasks to get updated status
        await fetchTasks();
      } catch (err: any) {
        setError(err.message || 'Failed to give up task');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [childId, fetchTasks]
  );

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    assignTask: assignNewTask,
    updateTask,
    unassignTask: unassign,
    completeTask: markComplete,
    verifyTask: verify,
    giveupTask: giveup,
  };
};

// ============================================================================
// SUGGESTED TASKS HOOK
// ============================================================================

export const useSuggestedTasks = (childId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!childId) return [];

    setLoading(true);
    setError(null);
    try {
      const data = await getSuggestedTasks(childId);
      setTasks(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch suggested tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [childId]);

  return {
    tasks,
    loading,
    error,
    fetchSuggestions,
  };
};
