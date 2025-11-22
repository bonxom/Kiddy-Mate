import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '../../../utils/errorHandler';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Star, User } from 'lucide-react';
import { useChildContext } from '../../../providers/ChildProvider';
import { createAndAssignTask } from '../../../api/services/taskService';
import type { CreateAndAssignTaskRequest } from '../../../api/services/taskService';
import { mapToBackendCategory } from '../../../utils/taskMappers';
import { getCategoryConfig, TASK_CATEGORY_LABELS, ICON_SIZES } from '../../../constants/taskConfig';
import { TaskEvents } from '../../../utils/events';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void; // Callback to refresh assigned tasks
}

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) => {
  const { children, selectedChildId, setSelectedChildId } = useChildContext();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    childId: selectedChildId || '',
    taskName: '',
    description: '',
    category: 'self-discipline' as 'self-discipline' | 'logic' | 'physical' | 'creativity' | 'social' | 'academic',
    priority: 'medium' as 'high' | 'medium' | 'low',
    reward: 10,
    dueDate: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.childId) {
      toast.error('Please select a child');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create task data matching backend schema
      const taskData: CreateAndAssignTaskRequest = {
        title: formData.taskName,
        description: formData.description,
        category: mapToBackendCategory(formData.category),
        type: 'logic', // Default type - can be made configurable
        difficulty: formData.priority === 'high' ? 3 : formData.priority === 'medium' ? 2 : 1,
        suggested_age_range: '6-12', // Default - can be made configurable
        reward_coins: formData.reward,
        // Assignment params
        priority: formData.priority,
        due_date: formData.dueDate || undefined,
        notes: formData.notes || undefined,
      };

      await createAndAssignTask(formData.childId, taskData);

      // Update selected child if different
      if (formData.childId !== selectedChildId) {
        setSelectedChildId(formData.childId);
      }

      // Invalidate dashboard cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['dashboard', formData.childId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      // Emit event to notify AssignedTasksTab to refresh
      TaskEvents.emit(TaskEvents.TASK_ASSIGNED, { childId: formData.childId });

      // Notify parent to refresh
      onTaskCreated?.();

      onClose();

      // Reset form
      setFormData({
        childId: selectedChildId || '',
        taskName: '',
        description: '',
        category: 'self-discipline',
        priority: 'medium',
        reward: 10,
        dueDate: '',
        notes: '',
      });

      toast.success('Task created and assigned successfully! 🎉');
    } catch (error) {
      handleApiError(error, 'Failed to create and assign task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create & Assign Task" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Child Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign to Child <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={formData.childId}
              onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              required
            >
              <option value="">Select a child</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Task Name */}
        <Input
          label="Task Name"
          type="text"
          placeholder="e.g., Clean bedroom"
          value={formData.taskName}
          onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
          required
          fullWidth
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            placeholder="Describe the task in detail..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(TASK_CATEGORY_LABELS).map(([value, label]) => {
              const config = getCategoryConfig(value as any);
              const Icon = config.icon;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: value as any })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${formData.category === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                >
                  <Icon className={ICON_SIZES.sm} />
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, priority: 'high' })}
              className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-200 ${formData.priority === 'high'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-red-300'
                }`}
            >
              High
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, priority: 'medium' })}
              className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-200 ${formData.priority === 'medium'
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-300'
                }`}
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, priority: 'low' })}
              className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-200 ${formData.priority === 'low'
                ? 'border-gray-500 bg-gray-50 text-gray-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
            >
              Low
            </button>
          </div>
        </div>

        {/* Reward */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reward (Coins) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="50"
              value={formData.reward}
              onChange={(e) =>
                setFormData({ ...formData, reward: parseInt(e.target.value) })
              }
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex items-center gap-1 min-w-[60px] px-3 py-2 bg-yellow-50 rounded-lg">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-gray-900">{formData.reward}</span>
            </div>
          </div>
        </div>

        {/* Due Date (Optional) */}
        <Input
          label="Due Date (Optional)"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          fullWidth
        />

        {/* Notes (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            placeholder="Add any special instructions..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create & Assign'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
