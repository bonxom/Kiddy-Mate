import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { handleApiError } from '../../../utils/errorHandler';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { Star } from 'lucide-react';
import type { AssignedTask } from '../../../types/task.types';
import { useAssignedTasks } from '../../../hooks/useTasks';
import { mapToBackendPriority } from '../../../utils/taskMappers';
import type { ChildTaskUpdate } from '../../../api/services/taskService';
import { useChildContext } from '../../../providers/ChildProvider';
import {
  getCategoryConfig,
  getPriorityConfig,
  getStatusConfig,
  ICON_SIZES
} from '../../../constants/taskConfig';

interface ExtendedAssignedTask extends AssignedTask {
  category: 'self-discipline' | 'logic' | 'creativity' | 'social' | 'physical' | 'academic';
  priority: 'high' | 'medium' | 'low';
  progress?: number;
  notes?: string;
  dueDate?: string;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: ExtendedAssignedTask;
  onSave?: (task: ExtendedAssignedTask) => void;
  onDelete?: (taskId: string) => void;
  onUpdate?: () => void; // Callback to refresh task list after update
}

const TaskDetailModal = ({ isOpen, onClose, task, onSave, onDelete, onUpdate }: TaskDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExtendedAssignedTask>(task);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { children } = useChildContext();

  // Get childId from task's child_id field (assuming backend returns this)
  // or from the child name mapping
  const getChildIdFromName = (childName: string): string => {
    const child = children.find(c => c.name === childName);
    return child?.id || '';
  };

  const childId = getChildIdFromName(formData.child);
  const { updateTask } = useAssignedTasks(childId);

  useEffect(() => {
    setFormData(task);
    setIsEditing(false);
    // console.log('📋 TaskDetailModal - Task loaded:', {
    //   task,
    //   childName: task.child,
    //   resolvedChildId: getChildIdFromName(task.child),
    //   availableChildren: children
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, isOpen]); // Only re-run when task or isOpen changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare update data - only include fields that have changed
      const updates: ChildTaskUpdate = {};

      if (formData.priority) {
        updates.priority = mapToBackendPriority(formData.priority);
      }

      if (formData.progress !== undefined && formData.progress !== null) {
        updates.progress = formData.progress;
      }

      if (formData.dueDate) {
        // Send date string directly in YYYY-MM-DD format
        updates.due_date = formData.dueDate;
      }

      if (formData.notes !== undefined) {
        updates.notes = formData.notes;
      }

      // Custom override fields
      if (formData.task !== task.task) {
        updates.custom_title = formData.task;
      }

      if (formData.reward !== task.reward) {
        updates.custom_reward_coins = formData.reward;
      }

      console.log('🔍 DEBUG - Update Task:', {
        childId,
        taskId: task.id,
        updates,
        formData
      });

      // Call API to update
      if (childId && Object.keys(updates).length > 0) {
        const result = await updateTask(task.id, updates);
        console.log('✅ Update successful:', result);
      } else {
        console.warn('⚠️ No updates to send or missing childId:', { childId, updates });
      }

      // Call parent callback if provided
      if (onSave) {
        onSave(formData);
      }

      setIsEditing(false);

      // Trigger refresh of task list BEFORE closing modal
      if (onUpdate) {
        await onUpdate(); // Wait for refresh to complete
      }

      onClose();

      toast.success('Task updated successfully!');
    } catch (error) {
      handleApiError(error, 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
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
            {(() => {
              const statusConfig = getStatusConfig(formData.status);
              return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
            })()}
            {(() => {
              const priorityConfig = getPriorityConfig(formData.priority);
              const Icon = priorityConfig.icon;
              return (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${priorityConfig.color}`}>
                  <Icon className={ICON_SIZES.sm} />
                  <span>{priorityConfig.label} Priority</span>
                </div>
              );
            })()}
          </div>

          {isEditing ? (
            <>
              {/* Child Name - READ ONLY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
                <Input
                  type="text"
                  value={formData.child}
                  disabled
                  fullWidth
                />
                <p className="text-xs text-gray-500 mt-1">Cannot reassign task to different child</p>
              </div>

              {/* Task Name - Editable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                <Input
                  type="text"
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  fullWidth
                  placeholder="Enter task name"
                />
                <p className="text-xs text-gray-500 mt-1">This creates a custom version for this assignment</p>
              </div>

              {/* Category - READ ONLY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                {(() => {
                  const config = getCategoryConfig(formData.category);
                  const Icon = config.icon;
                  return (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${config.color}`}>
                      <Icon className={ICON_SIZES.sm} />
                      <span>{config.label}</span>
                    </div>
                  );
                })()}
                <p className="text-xs text-gray-500 mt-2">Category is from task template</p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
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

              {/* Reward - Editable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reward (Coins)</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: parseInt(e.target.value) || 0 })}
                  fullWidth
                  placeholder="Enter reward coins"
                />
                <p className="text-xs text-gray-500 mt-1">Override default reward for this assignment</p>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  fullWidth
                />
              </div>

              {/* Progress */}
              {formData.progress !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress: {formData.progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>
              )}

              {/* Notes */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Add notes or special instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
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
                  {(() => {
                    const config = getCategoryConfig(formData.category);
                    const Icon = config.icon;
                    return (
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${config.color}`}>
                        <Icon className={ICON_SIZES.sm} />
                        <span>{config.label}</span>
                      </div>
                    );
                  })()}
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
                  <p className="text-base font-bold text-gray-900">
                    {formData.dueDate ? new Date(formData.dueDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No due date'}
                  </p>
                </div>
              </div>

              {/* Notes - Full Width */}
              {formData.notes && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</label>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.notes}</p>
                </div>
              )}
            </>
          )}

          {/* Progress Bar for View Mode */}
          {(!isEditing && formData.progress !== undefined) && (
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
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-gray-900 font-semibold text-base">
              Are you sure you want to delete the task "{task.task}"?
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone.
            </p>
          </div>
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