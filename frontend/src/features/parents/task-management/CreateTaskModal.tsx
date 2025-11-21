import { useState } from 'react';
import toast from 'react-hot-toast';
import { handleApiError } from '../../../utils/errorHandler';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Star } from 'lucide-react';
import { useTaskLibrary } from '../../../hooks/useTasks';
import { mapToBackendCategory } from '../../../utils/taskMappers';
import type { TaskCreate } from '../../../api/services/taskService';
import { getCategoryConfig, TASK_CATEGORY_LABELS, ICON_SIZES } from '../../../constants/taskConfig';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTaskModal = ({ isOpen, onClose }: CreateTaskModalProps) => {
  const { createTask } = useTaskLibrary();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    category: 'self-discipline' as 'self-discipline' | 'logic' | 'physical' | 'creativity' | 'social' | 'academic',
    priority: 'medium' as 'high' | 'medium' | 'low',
    reward: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create task data matching backend schema
      const taskData: TaskCreate = {
        title: formData.taskName,
        description: formData.description,
        category: mapToBackendCategory(formData.category),
        type: 'logic', // Default type - can be made configurable
        difficulty: formData.priority === 'high' ? 3 : formData.priority === 'medium' ? 2 : 1,
        suggested_age_range: '6-12', // Default - can be made configurable
        reward_coins: formData.reward,
      };

      await createTask(taskData);

      onClose();

      // Reset form
      setFormData({
        taskName: '',
        description: '',
        category: 'self-discipline',
        priority: 'medium',
        reward: 10,
      });

      toast.success('Task created successfully!');
    } catch (error) {
      handleApiError(error, 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task Template" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
