import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Star, Library } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/ui/Loading';
import type { LibraryTask, TaskCategory } from '../../../types/task.types';
import AssignTaskModal from './AssignTaskModal';
import { useTaskLibrary } from '../../../hooks/useTasks';
import { mapToLibraryTask } from '../../../utils/taskMappers';
import { getCategoryConfig, TASK_CATEGORY_LABELS, ICON_SIZES } from '../../../constants/taskConfig';

interface TaskLibraryTabProps {
  onCountChange?: (count: number) => void;
}

const TaskLibraryTab = ({ onCountChange }: TaskLibraryTabProps) => {
  // Use real API
  const { tasks: backendTasks, loading, error, fetchTasks } = useTaskLibrary();

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Map backend tasks to frontend format
  const tasks = useMemo(() => {
    return backendTasks.map(mapToLibraryTask);
  }, [backendTasks]);

  // Update parent count when tasks change
  useEffect(() => {
    onCountChange?.(tasks.length);
  }, [tasks.length, onCountChange]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<LibraryTask | null>(null);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === 'all' || task.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [tasks, searchQuery, selectedCategory]);

  const handleAssignClick = (task: LibraryTask) => {
    setSelectedTask(task);
    setIsAssignModalOpen(true);
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

      {/* Content */}
      {!loading && (
        <>
      {/* Search and Filter */}
      <div className="flex gap-4 mb-4">
        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            fullWidth
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as TaskCategory | 'all')}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            <option value="all">All Categories</option>
            {Object.entries(TASK_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-soft">
        <table className="w-full">
          <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Suggested Child
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Task Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Suggested Reward
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredTasks.map((task, index) => (
              <tr 
                key={task.id} 
                className="hover:shadow-md transition-all duration-200 group cursor-pointer"
                onClick={() => handleAssignClick(task)}
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
                <td className="px-4 py-4">
                  <span className="text-sm font-medium text-gray-700">
                    {task.suggestedChild || '-'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {task.task}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {(() => {
                    const config = getCategoryConfig(task.category);
                    const Icon = config.icon;
                    return (
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 hover:scale-105 ${config.color}`}>
                        <Icon className={ICON_SIZES.sm} />
                        <span>{config.label}</span>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {task.description}
                  </p>
                </td>
                <td className="px-4 py-4 text-center">
                  <div 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-200 group-hover:shadow-md transition-all duration-200"
                    style={{ background: 'linear-gradient(to right, rgb(254 252 232), rgb(254 243 199))' }}
                  >
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-yellow-600">
                      {task.suggestedReward}
                    </span>
                    <span className="text-xs text-yellow-600">Coins</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignClick(task);
                    }}
                    className="group-hover:scale-105 transition-transform duration-200"
                  >
                    Assign Task
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-gray-50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Library className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No tasks found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or create new tasks</p>
          </div>
        )}
      </div>
        </>
      )}

      {/* Assign Task Modal */}
      {selectedTask && (
        <AssignTaskModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSuccess={() => {
            // Refresh task library after successful assignment
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};

export default TaskLibraryTab;
