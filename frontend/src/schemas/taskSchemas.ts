/**
 * Validation schemas for Task Management forms
 * Using Zod for runtime type validation
 */

import { z } from 'zod';

/**
 * Schema for creating a new task template
 */
export const createTaskSchema = z.object({
  taskName: z.string()
    .min(3, 'Task name must be at least 3 characters')
    .max(100, 'Task name cannot exceed 100 characters'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  category: z.enum([
    'self-discipline',
    'logic',
    'physical',
    'creativity',
    'social',
    'academic'
  ]),
  priority: z.enum(['high', 'medium', 'low']),
  reward: z.number()
    .min(1, 'Reward must be at least 1 coin')
    .max(50, 'Reward cannot exceed 50 coins')
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

/**
 * Schema for assigning a task to a child
 */
export const assignTaskSchema = z.object({
  childId: z.string()
    .min(1, 'Please select a child'),
  taskName: z.string()
    .min(3, 'Task name must be at least 3 characters')
    .max(100, 'Task name cannot exceed 100 characters'),
  category: z.enum([
    'self-discipline',
    'logic',
    'physical',
    'creativity',
    'social',
    'academic'
  ]),
  priority: z.enum(['high', 'medium', 'low']),
  reward: z.number()
    .min(1, 'Reward must be at least 1 coin')
    .max(50, 'Reward cannot exceed 50 coins'),
  dueDate: z.string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true; // Optional field
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        return selectedDate >= today;
      },
      { message: 'Due date cannot be in the past' }
    )
});

export type AssignTaskFormData = z.infer<typeof assignTaskSchema>;

/**
 * Schema for updating an assigned task
 */
export const updateTaskSchema = z.object({
  priority: z.enum(['high', 'medium', 'low']),
  progress: z.number()
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100%'),
  date: z.string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true; // Optional field
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      { message: 'Due date cannot be in the past' }
    )
});

export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
