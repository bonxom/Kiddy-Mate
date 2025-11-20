import { useState } from 'react';
import { Plus, ListTodo, Library } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AssignedTasksTab from '../../features/parents/task-management/AssignedTasksTab';
import TaskLibraryTab from '../../features/parents/task-management/TaskLibraryTab';
import CreateTaskModal from '../../features/parents/task-management/CreateTaskModal';
import { ChildProvider } from '../../contexts/ChildContext';

type TabType = 'assigned' | 'library';

const TaskCenterContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>('assigned');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignedCount, setAssignedCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);

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
    <div className="min-h-screen overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin">
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
                  className={`
                    flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-all relative whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'text-primary-700 bg-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-colors ${
                    activeTab === tab.id ? 'text-primary-600' : ''
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
                <AssignedTasksTab onCountChange={setAssignedCount} />
              ) : (
                <TaskLibraryTab onCountChange={setLibraryCount} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
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
