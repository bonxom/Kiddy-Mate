import { useState } from 'react';
import toast from 'react-hot-toast';
import { handleApiError } from '../../../utils/errorHandler';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Star } from 'lucide-react';
import type { LibraryTask } from '../../../types/task.types';
import { assignTask } from '../../../api/services/taskService';
import { useChildContext } from '../../../providers/ChildProvider';
import { TaskEvents } from '../../../utils/events';
import { getCategoryConfig, TASK_CATEGORY_LABELS, ICON_SIZES } from '../../../constants/taskConfig';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: LibraryTask;
  onSuccess?: () => void;
}

const AssignTaskModal = ({ isOpen, onClose, task, onSuccess }: AssignTaskModalProps) => {
  const { children } = useChildContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    childId: '',
    taskName: task.task,
    category: task.category,
    priority: 'medium' as 'high' | 'medium' | 'low',
    reward: task.suggestedReward || 10,
    dueDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.childId) {
      toast.error('Please select a child');
      return;
    }

    setIsSubmitting(true);
    try {
      // Assign task to child with due_date and priority
      await assignTask(formData.childId, task.id, {
        due_date: formData.dueDate || undefined,
        priority: formData.priority,
        notes: undefined
      });

      // Emit event to notify library to refresh
      TaskEvents.emit(TaskEvents.LIBRARY_UPDATED);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      onClose();

      toast.success('Task assigned successfully!');
    } catch (error) {
      handleApiError(error, 'Failed to assign task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Task" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Info */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-1">{task.task}</h3>
          <p className="text-sm text-gray-600">{task.description}</p>
        </div>

        {/* Child Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Child <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.childId}
            onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          >
            <option value="">-- Select Child --</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
        </div>

        {/* Task Name (Editable) */}
        <Input
          label="Task Name"
          type="text"
          placeholder="Edit task name if needed"
          value={formData.taskName}
          onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
          required
          fullWidth
        />

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
          <p className="text-xs text-gray-500 mt-1">
            Suggested: {task.suggestedReward} coins
          </p>
        </div>

        {/* Due Date */}
        <Input
          label="Due Date (Optional)"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          fullWidth
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignTaskModal;
