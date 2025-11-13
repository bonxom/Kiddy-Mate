import { useState, useMemo } from 'react';
import { Search, Trash2, ArrowUpDown, Target, Brain, Dumbbell, Palette, Users, BookOpen, Star, AlertCircle, TrendingUp, Minus } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import type { AssignedTask, TaskStatus } from '../../../types/task.types';

// Mock data
interface ExtendedAssignedTask extends AssignedTask {
  category: 'self-discipline' | 'logic' | 'creativity' | 'social' | 'physical' | 'academic';
  priority: 'high' | 'medium' | 'low';
  progress?: number;
}

const mockAssignedTasks: ExtendedAssignedTask[] = [
  {
    id: '1',
    child: 'Minh An',
    task: 'Dọn phòng ngủ',
    date: '2025-11-10',
    status: 'completed',
    reward: 10,
    category: 'self-discipline',
    priority: 'medium',
    progress: 100,
  },
  {
    id: '2',
    child: 'Minh An',
    task: 'Làm bài tập toán',
    date: '2025-11-12',
    status: 'in-progress',
    reward: 15,
    category: 'logic',
    priority: 'high',
    progress: 65,
  },
  {
    id: '3',
    child: 'Thu Hà',
    task: 'Đọc sách 15 phút',
    date: '2025-11-13',
    status: 'assigned',
    reward: 8,
    category: 'academic',
    priority: 'low',
    progress: 0,
  },
  {
    id: '4',
    child: 'Minh An',
    task: 'Tưới cây',
    date: '2025-11-09',
    status: 'missed',
    reward: 5,
    category: 'self-discipline',
    priority: 'low',
    progress: 0,
  },
  {
    id: '5',
    child: 'Thu Hà',
    task: 'Vẽ tranh tự do',
    date: '2025-11-13',
    status: 'in-progress',
    reward: 12,
    category: 'creativity',
    priority: 'medium',
    progress: 40,
  },
  {
    id: '6',
    child: 'Minh An',
    task: 'Chơi game nhóm',
    date: '2025-11-13',
    status: 'assigned',
    reward: 18,
    category: 'social',
    priority: 'high',
    progress: 0,
  },
];

const AssignedTasksTab = () => {
  const [tasks, setTasks] = useState<ExtendedAssignedTask[]>(mockAssignedTasks);

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

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter((task) => task.id !== taskToDelete));
      setTaskToDelete(null);
      setDeleteModalOpen(false);
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
      {/* Search */}
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
                className="hover:shadow-md transition-all duration-200 group"
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
    </div>
  );
};

export default AssignedTasksTab;
