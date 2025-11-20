import { useState, useMemo, useEffect } from 'react';
import { Search, Trash2, ArrowUpDown, Target, Brain, Dumbbell, Palette, Users, BookOpen, Star, AlertCircle, TrendingUp, Minus } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/ui/Loading';
import TaskDetailModal from './TaskDetailModal';
import type { AssignedTask, TaskStatus } from '../../../types/task.types';
import { useAssignedTasks } from '../../../hooks/useTasks';
import { mapToUIAssignedTask } from '../../../utils/taskMappers';
import { useChildContext } from '../../../contexts/ChildContext';

// Extended interface for UI
interface ExtendedAssignedTask extends AssignedTask {
  category: 'self-discipline' | 'logic' | 'creativity' | 'social' | 'physical' | 'academic';
  priority: 'high' | 'medium' | 'low';
  progress?: number;
}

const AssignedTasksTab = () => {
  const { selectedChildId, children, setSelectedChildId } = useChildContext();
  
  const { 
    tasks: backendTasks, 
    loading, 
    error,
    fetchTasks,
    unassignTask,
  } = useAssignedTasks(selectedChildId || '');

  // Fetch tasks on mount and when selected child changes
  useEffect(() => {
    if (selectedChildId) {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]); // Only re-fetch when selectedChildId changes

  // Create child name lookup map
  const childMap = useMemo(() => {
    const map: Record<string, string> = {};
    children.forEach(c => map[c.id] = c.name);
    return map;
  }, [children]);

  // Transform backend tasks to UI format
  const tasks = useMemo(() => {
    return backendTasks.map(task => {
      // Get child name from map, fallback to 'Unknown Child'
      const childName = childMap[selectedChildId || ''] || 'Unknown Child';
      return mapToUIAssignedTask(task, childName);
    });
  }, [backendTasks, childMap, selectedChildId]);

  const getCategoryIcon = (category: ExtendedAssignedTask['category']) => {
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
    }
  };

  const getCategoryColor = (category: ExtendedAssignedTask['category']) => {
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
    }
  };

  const getCategoryLabel = (category: ExtendedAssignedTask['category']) => {
    switch (category) {
      case 'self-discipline':
        return 'Independence';
      case 'logic':
        return 'Logic';
      case 'physical':
        return 'Physical';
      case 'creativity':
        return 'Creativity';
      case 'social':
        return 'Social';
      case 'academic':
        return 'Academic';
    }
  };

  const getPriorityBadge = (priority: ExtendedAssignedTask['priority']) => {
    const priorityConfig = {
      high: { 
        icon: AlertCircle, 
        color: 'text-red-600 bg-red-50 border-red-200',
        label: 'High'
      },
      medium: { 
        icon: TrendingUp, 
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        label: 'Medium'
      },
      low: { 
        icon: Minus, 
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        label: 'Low'
      },
    };
    
    const config = priorityConfig[priority];
    const Icon = config.icon;
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${config.color}`}>
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </div>
    );
  };
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

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        await unassignTask(taskToDelete);
        setTaskToDelete(null);
        setDeleteModalOpen(false);
        // Tasks will auto-refresh via the hook
      } catch (err) {
        console.error('Failed to delete task:', err);
        // TODO: Show error toast notification
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
      // Tasks will auto-refresh via the hook
    } catch (err) {
      console.error('Failed to delete task:', err);
      // TODO: Show error toast notification
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    const statusConfig = {
      assigned: { variant: 'info' as const, label: 'Assigned' },
      'in-progress': { variant: 'warning' as const, label: 'In Progress' },
      completed: { variant: 'success' as const, label: 'Completed' },
      missed: { variant: 'danger' as const, label: 'Missed' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div>
      {/* Child Selector */}
      {!loading && children.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Child
          </label>
          <select
            value={selectedChildId || ''}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
        </div>
      )}

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
      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-md">
        <table className="w-full">
          <thead style={{ background: 'linear-gradient(to right, rgb(249 250 251), rgb(243 244 246))' }}>
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
                  <span className={`text-sm font-medium ${
                    task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}>
                    {task.task}
                  </span>
                </td>

                {/* Category */}
                <td className="px-4 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 group-hover:scale-105 ${getCategoryColor(task.category)}`}>
                    {getCategoryIcon(task.category)}
                    <span>{getCategoryLabel(task.category)}</span>
                  </div>
                </td>

                {/* Priority */}
                <td className="px-4 py-4">
                  {getPriorityBadge(task.priority)}
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
                          background: task.status === 'completed' 
                            ? 'linear-gradient(to right, #10b981, #059669)'
                            : task.status === 'in-progress'
                            ? 'linear-gradient(to right, #3b82f6, #2563eb)'
                            : 'linear-gradient(to right, #94a3b8, #64748b)'
                        }}
                      />
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  {getStatusBadge(task.status)}
                </td>

                {/* Reward */}
                <td className="px-4 py-4 text-right">
                  <div 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-200 group-hover:shadow-md transition-all duration-200"
                    style={{ background: 'linear-gradient(to right, rgb(254 252 232), rgb(254 243 199))' }}
                  >
                    <Star className={`w-4 h-4 ${
                      task.status === 'completed' 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-yellow-400'
                    }`} />
                    <span className={`text-sm font-bold ${
                      task.status === 'completed' 
                        ? 'text-yellow-600' 
                        : 'text-yellow-500'
                    }`}>
                      {task.reward}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
                    title="Xóa nhiệm vụ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks found
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
          <p className="text-gray-900 font-medium text-base">
            Are you sure you want to delete this task?
          </p>
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
