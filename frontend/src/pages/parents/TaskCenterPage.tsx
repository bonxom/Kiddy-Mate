import { useState, useEffect } from 'react';
import { Plus, ListTodo, Library } from 'lucide-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AssignedTasksTab from '../../features/parents/task-management/AssignedTasksTab';
import TaskLibraryTab from '../../features/parents/task-management/TaskLibraryTab';
import CreateTaskModal from '../../features/parents/task-management/CreateTaskModal';
import { ChildProvider, useChild } from '../../providers/ChildProvider';
import { getChildTasks } from '../../api/services/taskService';

type TabType = 'assigned' | 'library';

const TaskCenterContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>('assigned');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignedCount, setAssignedCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);
  const queryClient = useQueryClient();
  const { children, selectedChildId } = useChild();

  const handleTaskCreated = () => {
    // Switch to assigned tab and invalidate queries to refresh
    setActiveTab('assigned');
    queryClient.invalidateQueries({ queryKey: ['assigned-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['task-library'] });
  };

  const handleTabHover = (tab: TabType) => {
    // Prefetch data when hovering over tab for faster switching
    if (tab === 'assigned') {
      queryClient.prefetchQuery({ 
        queryKey: ['assigned-tasks', children.map(c => c.id).sort().join(',')],
        queryFn: async () => {
          if (children.length === 0) return [];
          const tasksPromises = children.map(async (child) => {
            try {
              const tasks = await getChildTasks(child.id);
              return tasks.map(task => ({ task, childId: child.id }));
            } catch (err) {
              console.error(`Failed to fetch tasks for child ${child.id}:`, err);
              return [];
            }
          });
          const allTasksResults = await Promise.all(tasksPromises);
          return allTasksResults.flat();
        },
      });
    } else {
      if (selectedChildId) {
        queryClient.prefetchQuery({ 
          queryKey: ['task-library', selectedChildId],
          queryFn: async () => {
            return await getChildTasks(selectedChildId, { status: 'unassigned' });
          },
        });
      }
    }
  };

  // Prefetch library data when assigned tasks finish loading
  const { data: assignedTasksData, isLoading: assignedTasksLoading } = useQuery({
    queryKey: ['assigned-tasks', children.map(c => c.id).sort().join(',')],
    queryFn: async () => {
      if (children.length === 0) return [];
      const tasksPromises = children.map(async (child) => {
        try {
          const tasks = await getChildTasks(child.id);
          return tasks.map(task => ({ task, childId: child.id }));
        } catch (err) {
          console.error(`Failed to fetch tasks for child ${child.id}:`, err);
          return [];
        }
      });
      const allTasksResults = await Promise.all(tasksPromises);
      return allTasksResults.flat();
    },
    enabled: children.length > 0,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  // Prefetch library data when assigned tasks finish loading
  useEffect(() => {
    if (!assignedTasksLoading && assignedTasksData !== undefined && selectedChildId) {
      // Prefetch library data in background
      queryClient.prefetchQuery({ 
        queryKey: ['task-library', selectedChildId],
        queryFn: async () => {
          return await getChildTasks(selectedChildId, { status: 'unassigned' });
        },
      });
    }
  }, [assignedTasksLoading, assignedTasksData, selectedChildId, queryClient]);

  // Calculate library count even when not on library tab
  const { data: libraryTasksData } = useQuery({
    queryKey: ['task-library', selectedChildId],
    queryFn: async () => {
      if (!selectedChildId) return [];
      return await getChildTasks(selectedChildId, { status: 'unassigned' });
    },
    enabled: !!selectedChildId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  // Update library count from prefetched data
  useEffect(() => {
    if (libraryTasksData !== undefined) {
      setLibraryCount(libraryTasksData.length);
    }
  }, [libraryTasksData]);

  const tabs = [
    {
      id: 'assigned' as TabType,
      label: 'Assigned Tasks',
      icon: ListTodo,
      count: assignedCount,
    },
    {
      id: 'library' as TabType,
      label: 'Task Library',
      icon: Library,
      count: libraryCount,
    },
  ];

  return (
    <div className="min-h-screen overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Task Center 📋
          </h1>
          <p className="text-gray-600">
            Manage and create tasks to help your children develop great habits
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex items-center justify-between border-b-2 border-gray-200 bg-gray-50/50">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    onMouseEnter={() => handleTabHover(tab.id)}
                    className={`
                    flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-all duration-300 relative whitespace-nowrap
                    ${activeTab === tab.id
                        ? 'text-primary-700 bg-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/70 hover:shadow-soft'
                      }
                  `}
                  >
                    <Icon className={`w-5 h-5 transition-colors ${activeTab === tab.id ? 'text-primary-600' : ''
                      }`} />
                    <span>{tab.label}</span>
                    <Badge
                      variant={activeTab === tab.id ? 'primary' : 'default'}
                      size="sm"
                    >
                      {tab.count}
                    </Badge>

                    {/* Active indicator */}
                    {activeTab === tab.id && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 rounded-t-md"
                        style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Create Task Button */}
            <div className="px-4 py-2 shrink-0">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
                size="sm"
                className="whitespace-nowrap"
              >
                Add Task
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="animate-fade-in">
              {activeTab === 'assigned' ? (
                <AssignedTasksTab 
                  key={activeTab} // Force re-render when tab becomes active
                  onCountChange={setAssignedCount}
                />
              ) : (
                <TaskLibraryTab 
                  onCountChange={setLibraryCount}
                  onTaskAssigned={async () => {
                    // Switch to assigned tab after task is assigned
                    setActiveTab('assigned');
                    // Refetch assigned tasks immediately when switching to tab
                    await queryClient.refetchQueries({ queryKey: ['assigned-tasks'] });
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

const TaskCenterPage = () => {
  return (
    <ChildProvider>
      <TaskCenterContent />
    </ChildProvider>
  );
};

export default TaskCenterPage;
