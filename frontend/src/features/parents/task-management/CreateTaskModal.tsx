import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Star } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTaskModal = ({ isOpen, onClose }: CreateTaskModalProps) => {
  const [formData, setFormData] = useState({
    childId: '',
    taskName: '',
    reward: 10,
    dueDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log('Create task:', formData);
    onClose();
    // Reset form
    setFormData({
      childId: '',
      taskName: '',
      reward: 10,
      dueDate: '',
    });
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
            <option value="1">Minh An</option>
            <option value="2">Thu Hà</option>
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
