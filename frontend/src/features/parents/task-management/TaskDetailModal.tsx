import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { Star, Target, Brain, Dumbbell, Palette, Users, BookOpen, AlertCircle, TrendingUp, Minus } from 'lucide-react';
import type { AssignedTask } from '../../../types/task.types';

interface ExtendedAssignedTask extends AssignedTask {
  category: 'self-discipline' | 'logic' | 'creativity' | 'social' | 'physical' | 'academic';
  priority: 'high' | 'medium' | 'low';
  progress?: number;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: ExtendedAssignedTask;
  onSave?: (task: ExtendedAssignedTask) => void;
  onDelete?: (taskId: string) => void;
}

const TaskDetailModal = ({ isOpen, onClose, task, onSave, onDelete }: TaskDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ExtendedAssignedTask>(task);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setFormData(task);
    setIsEditing(false);
  }, [task, isOpen]);

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'self-discipline':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'logic':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'physical':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'creativity':
        return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'social':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'academic':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: AssignedTask['status']) => {
    const statusConfig = {
      assigned: { variant: 'info' as const, label: 'Assigned' },
      'in-progress': { variant: 'warning' as const, label: 'In Progress' },
      completed: { variant: 'success' as const, label: 'Completed' },
      missed: { variant: 'danger' as const, label: 'Missed' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4" />;
      case 'low':
        return <Minus className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
    setIsEditing(false);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Task" : "Task Details"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status and Priority Row */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            {getStatusBadge(formData.status)}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
              formData.priority === 'high' ? 'text-red-600 bg-red-50 border-red-200' :
              formData.priority === 'medium' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
              'text-gray-600 bg-gray-50 border-gray-200'
            }`}>
              {getPriorityIcon(formData.priority)}
              <span>{formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority</span>
            </div>
          </div>

          {isEditing ? (
            <>
              {/* Child Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
                <select
                  value={formData.child}
                  onChange={(e) => setFormData({ ...formData, child: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  required
                >
                  <option value="Minh An">Minh An</option>
                  <option value="Thu Hà">Thu Hà</option>
                </select>
              </div>

              {/* Task Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                <Input
                  type="text"
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  required
                  fullWidth
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Reward (Stars)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={formData.reward}
                    onChange={(e) => setFormData({ ...formData, reward: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <div className="flex items-center gap-1 min-w-[60px] px-3 py-2 bg-yellow-50 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900">{formData.reward}</span>
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  fullWidth
                />
              </div>
            </>
          ) : (
            <>
              {/* View Mode - Grid Layout */}
              <div className="grid grid-cols-2 gap-4">
                {/* Child */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Child</label>
                  <p className="text-base font-bold text-gray-900">{formData.child}</p>
                </div>

                {/* Category */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${getCategoryColor(formData.category)}`}>
                    {getCategoryIcon(formData.category)}
                    <span>{categoryLabels[formData.category]}</span>
                  </div>
                </div>

                {/* Task Name - Full Width */}
                <div className="col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Task Name</label>
                  <p className="text-base font-bold text-gray-900">{formData.task}</p>
                </div>

                {/* Reward */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reward</label>
                  <div className="flex items-center gap-1.5 w-fit px-3 py-2 rounded-lg border border-yellow-200" style={{ background: 'linear-gradient(to right, rgb(254 252 232), rgb(254 243 199))' }}>
                    <Star className="w-5 h-5 text-yellow-600 fill-yellow-500" />
                    <span className="font-bold text-gray-900 text-lg">{formData.reward}</span>
                    <span className="text-sm text-gray-700">Stars</span>
                  </div>
                </div>

                {/* Due Date */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Due Date</label>
                  <p className="text-base font-bold text-gray-900">{new Date(formData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </>
          )}

          {/* Progress */}
          {formData.progress !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${formData.progress}%`,
                      background: formData.progress === 100
                        ? 'linear-gradient(to right, #10b981, #059669)'
                        : formData.progress >= 50
                        ? 'linear-gradient(to right, #3b82f6, #8b5cf6)'
                        : 'linear-gradient(to right, #f59e0b, #d97706)',
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 text-right font-medium">{formData.progress}% Complete</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            {isEditing ? (
              <>
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                {onDelete && (
                  <Button type="button" variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                    Delete
                  </Button>
                )}
                <div className="flex-1" />
                <Button type="button" variant="secondary" onClick={onClose}>
                  Close
                </Button>
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              </>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-900 font-medium text-base">
            Are you sure you want to delete the task "{task.task}"?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TaskDetailModal;
