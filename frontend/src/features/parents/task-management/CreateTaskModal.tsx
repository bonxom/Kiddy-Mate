import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Star, Target, Brain, Dumbbell, Palette, Users, BookOpen } from 'lucide-react';
import { useTaskLibrary } from '../../../hooks/useTasks';
import { mapToBackendCategory } from '../../../utils/taskMappers';
import type { TaskCreate } from '../../../api/services/taskService';
import { useChildContext } from '../../../contexts/ChildContext';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTaskModal = ({ isOpen, onClose }: CreateTaskModalProps) => {
  const { createTask } = useTaskLibrary();
  const { children } = useChildContext();
  
  const [formData, setFormData] = useState({
    childId: '',
    taskName: '',
    description: '',
    category: 'self-discipline' as 'self-discipline' | 'logic' | 'physical' | 'creativity' | 'social' | 'academic',
    priority: 'medium' as 'high' | 'medium' | 'low',
    reward: 10,
    dueDate: '',
  });

  const getCategoryIcon = (category: string) => {
    const iconClass = "w-4 h-4";
    switch (category) {
      case 'self-discipline':
        return <Target className={iconClass} />;
      case 'logic':
        return <Brain className={iconClass} />;
      case 'physical':
        return <Dumbbell className={iconClass} />;
      case 'creativity':
        return <Palette className={iconClass} />;
      case 'social':
        return <Users className={iconClass} />;
      case 'academic':
        return <BookOpen className={iconClass} />;
      default:
        return <Target className={iconClass} />;
    }
  };

  const categoryLabels: Record<string, string> = {
    'self-discipline': 'Independence',
    'logic': 'Logic',
    'physical': 'Physical',
    'creativity': 'Creativity',
    'social': 'Social',
    'academic': 'Academic',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        childId: '',
        taskName: '',
        description: '',
        category: 'self-discipline',
        priority: 'medium',
        reward: 10,
        dueDate: '',
      });
      
      // TODO: Show success toast notification
    } catch (error) {
      console.error('Failed to create task:', error);
      // TODO: Show error toast notification
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(categoryLabels).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, category: value as any })}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                  formData.category === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                }`}
              >
                {getCategoryIcon(value)}
                <span className="text-sm font-semibold">{label}</span>
              </button>
            ))}
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
              className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-200 ${
                formData.priority === 'high'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-red-300'
              }`}
            >
              High
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, priority: 'medium' })}
              className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-200 ${
                formData.priority === 'medium'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-300'
              }`}
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, priority: 'low' })}
              className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-200 ${
                formData.priority === 'low'
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
            Reward (Stars) <span className="text-red-500">*</span>
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
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
