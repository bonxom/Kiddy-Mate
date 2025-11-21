import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { handleApiError } from '../../../utils/errorHandler';
import { TaskEvents } from '../../../utils/events';
import { Search, Trash2, ArrowUpDown, CheckCircle, ListTodo } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/ui/Loading';
import TaskDetailModal from './TaskDetailModal';
import type { AssignedTask } from '../../../types/task.types';
import { useAssignedTasks } from '../../../hooks/useTasks';
import { mapToUIAssignedTask } from '../../../utils/taskMappers';
import { useChildContext } from '../../../providers/ChildProvider';
import {
  getCategoryConfig,
  getPriorityConfig,
  getStatusConfig,
  getProgressGradient,
  ICON_SIZES
} from '../../../constants/taskConfig';
import { Star } from 'lucide-react';

// Extended interface for UI
interface ExtendedAssignedTask extends AssignedTask {
  category: 'self-discipline' | 'logic' | 'creativity' | 'social' | 'physical' | 'academic';
  priority: 'high' | 'medium' | 'low';
  progress?: number;
}

interface AssignedTasksTabProps {
  onCountChange?: (count: number) => void;
}

const AssignedTasksTab = ({ onCountChange }: AssignedTasksTabProps) => {
  const { selectedChildId, children } = useChildContext();

  const {
    tasks: backendTasks,
    loading,
    error,
    fetchTasks,
    unassignTask,
    verifyTask,
  } = useAssignedTasks(selectedChildId || '');

  // Fetch tasks on mount and when selected child changes
  useEffect(() => {
    if (selectedChildId) {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]); // Only re-fetch when selectedChildId changes

  // Listen for library task updates and refresh assigned tasks
  useEffect(() => {
    return TaskEvents.listen(TaskEvents.LIBRARY_UPDATED, () => {
      if (selectedChildId) {
        fetchTasks();
      }
    });
  }, [selectedChildId, fetchTasks]);

  // Transform backend tasks to UI format
  const tasks = useMemo(() => {
    return backendTasks.map(task => {
      // Get child name directly
      const child = children.find(c => c.id === selectedChildId);
      const childName = child?.name || 'Unknown Child';
      return mapToUIAssignedTask(task, childName);
    });
  }, [backendTasks, children, selectedChildId]);

  // Update parent count when tasks change
  useEffect(() => {
    onCountChange?.(tasks.length);
  }, [tasks.length, onCountChange]);

  // Local state for UI interactions
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof ExtendedAssignedTask | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ExtendedAssignedTask | null>(null);

  // Filter and sort
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(
      (task) =>
        task.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.child.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [tasks, searchQuery, sortColumn, sortDirection]);

  const handleSort = (column: keyof ExtendedAssignedTask) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteModalOpen(true);
  };

  const handleVerifyClick = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    try {
      await verifyTask(taskId);
      toast.success('Task verified successfully!');
      // Tasks will auto-refresh via the hook
    } catch (err) {
      handleApiError(err, 'Failed to verify task');
    }
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        await unassignTask(taskToDelete);
        setTaskToDelete(null);
        setDeleteModalOpen(false);
        toast.success('Task deleted successfully!');
        // Tasks will auto-refresh via the hook
      } catch (err) {
        handleApiError(err, 'Failed to delete task');
      }
    }
  };

  const handleRowClick = (task: ExtendedAssignedTask) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  const handleSaveTask = async () => {
    // Task updates are handled in TaskDetailModal
    // Just close the modal and refresh will happen automatically
    setDetailModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await unassignTask(taskId);
      setDetailModalOpen(false);
      setSelectedTask(null);
      toast.success('Task deleted successfully!');
      // Tasks will auto-refresh via the hook
    } catch (err) {
      handleApiError(err, 'Failed to delete task');
    }
  };



  return (
    <div>
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-semibold">Error loading tasks</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* No Child Selected */}
      {!selectedChildId && !loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm">Please select a child to view their assigned tasks.</p>
        </div>
      )}

      {/* Search */}
      {selectedChildId && !loading && (
        <>
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tasks or child name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                fullWidth
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-soft">
            <table className="w-full">
              <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('child')}
                  >
                    <div className="flex items-center gap-2">
                      Child
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('task')}
                  >
                    <div className="flex items-center gap-2">
                      Task
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-2">
                      Category
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-2">
                      Priority
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Progress
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reward
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredTasks.map((task, index) => (
                  <tr
                    key={task.id}
                    className="hover:shadow-md transition-all duration-200 group cursor-pointer"
                    onClick={() => handleRowClick(task)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, rgba(239, 246, 255, 0.3), rgba(250, 245, 255, 0.3))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '';
                    }}
                    style={{
                      animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`
                    }}
                  >
                    {/* Child Name */}
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {task.child}
                      </span>
                    </td>

                    {/* Task Name */}
                    <td className="px-4 py-4">
                      <span className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                        {task.task}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      {(() => {
                        const config = getCategoryConfig(task.category);
                        const Icon = config.icon;
                        return (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 group-hover:scale-105 ${config.color}`}>
                            <Icon className={ICON_SIZES.sm} />
                            <span>{config.label}</span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-4">
                      {(() => {
                        const config = getPriorityConfig(task.priority);
                        const Icon = config.icon;
                        return (
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${config.color}`}>
                            <Icon className={ICON_SIZES.xs} />
                            <span>{config.label}</span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Progress */}
                    <td className="px-4 py-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-700">
                            {task.progress || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${task.progress || 0}%`,
                              background: getProgressGradient(task.status, task.progress || 0)
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {(() => {
                        const config = getStatusConfig(task.status);
                        return <Badge variant={config.variant}>{config.label}</Badge>;
                      })()}
                    </td>

                    {/* Reward */}
                    <td className="px-4 py-4 text-right">
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-200 group-hover:shadow-md transition-all duration-200"
                        style={{ background: 'linear-gradient(to right, rgb(254 252 232), rgb(254 243 199))' }}
                      >
                        <Star className={`w-4 h-4 ${task.status === 'completed'
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-yellow-400'
                          }`} />
                        <span className={`text-sm font-bold ${task.status === 'completed'
                          ? 'text-yellow-600'
                          : 'text-yellow-500'
                          }`}>
                          {task.reward}
                        </span>
                        <span className="text-xs text-yellow-600">Coins</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {task.status === 'need-verify' && (
                          <button
                            onClick={(e) => handleVerifyClick(task.id, e)}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
                            title="Duyệt nhiệm vụ"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(task.id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
                          title="Xóa nhiệm vụ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTasks.length === 0 && (
              <div className="text-center py-12 bg-gray-50">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <ListTodo className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No tasks found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or assign new tasks</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-gray-900 font-semibold text-base">
              Are you sure you want to delete this task?
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onUpdate={async () => {
            await fetchTasks(); // Refresh task list
            setSelectedTask(null); // Clear selected task to force re-render
            setDetailModalOpen(false); // Close modal after refresh
          }}
        />
      )}
    </div>
  );
};

export default AssignedTasksTab;
