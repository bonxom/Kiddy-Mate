import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Star, Library, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/ui/Loading';
import type { LibraryTask, TaskCategory } from '../../../types/task.types';
import AssignTaskModal from './AssignTaskModal';
import { getCategoryConfig, TASK_CATEGORY_LABELS, ICON_SIZES } from '../../../constants/taskConfig';
import { useChildContext } from '../../../providers/ChildProvider';
import { getChildTasks } from '../../../api/services/taskService';
import { analyzeEmotionReportAndGenerateTasks } from '../../../api/services/dashboardService';
import { TaskEvents } from '../../../utils/events';

interface TaskLibraryTabProps {
  onCountChange?: (count: number) => void;
  onTaskAssigned?: () => void;
}

const TaskLibraryTab = ({ onCountChange, onTaskAssigned }: TaskLibraryTabProps) => {
  const { children, selectedChildId, setSelectedChildId } = useChildContext();
  const queryClient = useQueryClient();

  // Fetch unassigned tasks for selected child (this is their personal task library)
  const {
    data: unassignedTasks = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['task-library', selectedChildId],
    queryFn: async () => {
      if (!selectedChildId) {
        return [];
      }
      // Fetch tasks with status='unassigned' for this child
      return await getChildTasks(selectedChildId, { status: 'unassigned' });
    },
    enabled: !!selectedChildId,
    staleTime: 0, // Always consider data stale to allow immediate refetch
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const error = queryError ? (queryError as Error).message : null;

  // Listen for task assignment/unassignment events to invalidate queries
  useEffect(() => {
    const refreshData = async () => {
      await queryClient.invalidateQueries({ queryKey: ['task-library'] });
      await queryClient.invalidateQueries({ queryKey: ['assigned-task-ids', selectedChildId] });
      await queryClient.refetchQueries({ queryKey: ['assigned-task-ids', selectedChildId] });
    };

    const cleanup1 = TaskEvents.listen(TaskEvents.TASK_ASSIGNED, refreshData);
    const cleanup2 = TaskEvents.listen(TaskEvents.TASK_UNASSIGNED, refreshData);

    return () => {
      cleanup1();
      cleanup2();
    };
  }, [queryClient, selectedChildId]);

  // Map unassigned ChildTasks to LibraryTask format
  const tasks = useMemo(() => {
    if (!selectedChildId || unassignedTasks.length === 0) {
      return [];
    }
    // Convert ChildTaskWithDetails to LibraryTask format
    return unassignedTasks.map((childTask) => {
      // Map backend category to frontend category format
      let category: TaskCategory = 'self-discipline'; // default
      const backendCategory = childTask.task.category.toLowerCase();
      if (backendCategory === 'independence') {
        category = 'self-discipline';
      } else if (backendCategory === 'logic') {
        category = 'logic';
      } else if (backendCategory === 'creativity') {
        category = 'creativity';
      } else if (backendCategory === 'social') {
        category = 'social';
      } else if (backendCategory === 'physical') {
        category = 'physical';
      } else if (backendCategory === 'academic') {
        category = 'academic';
      }
      
      // Get child name from selectedChildId
      const child = children.find(c => c.id === selectedChildId);
      const childName = child?.name || 'Unknown Child';
      
      return {
        id: childTask.task.id,
        task: childTask.task.title,
        description: childTask.task.description || '',
        category,
        suggestedReward: childTask.task.reward_coins || 10,
        difficulty: childTask.task.difficulty || 1,
        suggestedAgeRange: childTask.task.suggested_age_range || '6-12',
        suggestedChild: childName, // Populate with child name
        childTaskId: childTask.id, // Store childTaskId for assignment
      };
    });
  }, [unassignedTasks, selectedChildId]);

  // Update parent count when tasks change
  useEffect(() => {
    onCountChange?.(tasks.length);
  }, [tasks.length, onCountChange]);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<LibraryTask | null>(null);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);

  const handleGenerateTasksFromReport = async () => {
    if (!selectedChildId) {
      setSuccessMessage('Please select a child first.');
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    setIsGeneratingTasks(true);
    setSuccessMessage(null);
    try {
      const tasks = await analyzeEmotionReportAndGenerateTasks(selectedChildId);
      // Refresh library and assigned task IDs
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['task-library', selectedChildId] }),
        queryClient.invalidateQueries({ queryKey: ['assigned-task-ids'] }),
      ]);
      await queryClient.refetchQueries({ queryKey: ['task-library', selectedChildId] });
      TaskEvents.emit(TaskEvents.LIBRARY_UPDATED);
      setSuccessMessage(`Successfully generated ${tasks.length} tasks from emotion report!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error('Failed to generate tasks from report:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || '';
      
      // Always refresh to check if tasks were actually created (even if response failed)
      // This handles the case where tasks were inserted but response serialization failed
      const previousTaskCount = tasks.length;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['task-library', selectedChildId] }),
        queryClient.invalidateQueries({ queryKey: ['assigned-task-ids'] }),
      ]);
      await queryClient.refetchQueries({ queryKey: ['task-library', selectedChildId] });
      
      // Wait a bit for refetch to complete, then check if new tasks appeared
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ['task-library', selectedChildId] });
        const currentTasks = queryClient.getQueryData<typeof unassignedTasks>(['task-library', selectedChildId]) || [];
        
        // If new tasks appeared, it means generation was successful
        if (currentTasks.length > previousTaskCount) {
          const newTaskCount = currentTasks.length - previousTaskCount;
          TaskEvents.emit(TaskEvents.LIBRARY_UPDATED);
          setSuccessMessage(`Successfully generated ${newTaskCount} tasks from emotion report!`);
          setTimeout(() => setSuccessMessage(null), 5000);
        } else {
          // Check error message for specific cases
          if (errorMessage.includes('Tasks were created') || errorMessage.includes('refresh to see')) {
            TaskEvents.emit(TaskEvents.LIBRARY_UPDATED);
            setSuccessMessage('Tasks generated successfully! Please check the task library.');
            setTimeout(() => setSuccessMessage(null), 5000);
          } else if (errorMessage.includes('No reports found')) {
            setSuccessMessage('Failed to generate tasks. Please make sure you have generated a report first.');
            setTimeout(() => setSuccessMessage(null), 5000);
          } else {
            // Generic error - but still refresh in case tasks were created
            TaskEvents.emit(TaskEvents.LIBRARY_UPDATED);
            setSuccessMessage('Task generation completed. Please check the task library for new tasks.');
            setTimeout(() => setSuccessMessage(null), 5000);
          }
        }
      }, 500);
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.task.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === 'all' || task.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [tasks, debouncedSearchQuery, selectedCategory]);

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
          {/* No Child Selected Message */}
          {!selectedChildId && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                <strong>Please select a child</strong> to view their task library. Each child has their own task library showing tasks that haven't been assigned to them yet.
              </p>
            </div>
          )}

          {/* Generate Tasks from Report Button */}
          <div className="mb-4 p-4 bg-linear-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Task Generation
                </h3>
                <p className="text-xs text-gray-600">
                  Generate personalized tasks based on emotion analysis from your child's latest report
                </p>
              </div>
              
              {/* Child Selector for Generate Tasks */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Select Child:</label>
                  <button
                    type="button"
                    onClick={() => setIsChildSelectorOpen(!isChildSelectorOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[180px] justify-between"
                  >
                    <span className="truncate">
                      {selectedChildId 
                        ? children.find(c => c.id === selectedChildId)?.name || 'Select child'
                        : 'Select child'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isChildSelectorOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown */}
                  {isChildSelectorOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsChildSelectorOpen(false)}
                      />
                      <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Select Child
                          </p>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => {
                                setSelectedChildId(child.id);
                                setIsChildSelectorOpen(false);
                                // Invalidate task library query when child changes
                                queryClient.invalidateQueries({ queryKey: ['task-library', child.id] });
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                                selectedChildId === child.id ? 'bg-purple-50' : ''
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-semibold ${
                                    selectedChildId === child.id ? 'text-purple-700' : 'text-gray-900'
                                  }`}>
                                    {child.name}
                                  </span>
                                  {selectedChildId === child.id && (
                                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="pt-6">
                  <Button
                    variant="success"
                    size="sm"
                    loading={isGeneratingTasks}
                    icon={<Sparkles className="w-4 h-4" />}
                    onClick={handleGenerateTasksFromReport}
                    disabled={!selectedChildId || isGeneratingTasks}
                    className="whitespace-nowrap"
                  >
                    Generate Tasks
                  </Button>
                </div>
              </div>
            </div>
            {successMessage && (
              <div className={`mt-3 p-2 rounded-lg text-xs flex items-center gap-2 ${
                successMessage.includes('Failed') || successMessage.includes('Please select')
                  ? 'bg-red-50 text-red-700' 
                  : 'bg-green-50 text-green-700'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

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
                    const Icon = config?.icon;
                    if (!Icon) {
                      return (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border bg-gray-100 text-gray-700">
                          <span>{config?.label || task.category}</span>
                        </div>
                      );
                    }
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

        {!selectedChildId ? (
          <div className="text-center py-12 bg-gray-50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Library className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Select a child to view task library</p>
            <p className="text-sm text-gray-400 mt-1">Each child has their own task library showing tasks available for assignment</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Library className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No tasks available</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters or create new tasks'
                : `All tasks have been assigned to ${children.find(c => c.id === selectedChildId)?.name || 'this child'}. Create a new task to get started.`}
            </p>
          </div>
        ) : null}
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
          onSuccess={async () => {
            // Refresh task library after successful assignment
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['task-library'] }),
              queryClient.invalidateQueries({ queryKey: ['assigned-task-ids'] }),
              queryClient.invalidateQueries({ queryKey: ['assigned-tasks'] }),
            ]);
            
            // Refetch assigned tasks immediately
            await queryClient.refetchQueries({ queryKey: ['assigned-tasks'] });
            
            // Switch to assigned tasks tab
            if (onTaskAssigned) {
              await onTaskAssigned();
            }
          }}
        />
      )}
    </div>
  );
};

export default TaskLibraryTab;
