import { useState } from 'react';
import { Plus, ListTodo, Library } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AssignedTasksTab from '../../features/parents/task-management/AssignedTasksTab';
import TaskLibraryTab from '../../features/parents/task-management/TaskLibraryTab';
import CreateTaskModal from '../../features/parents/task-management/CreateTaskModal';

type TabType = 'assigned' | 'library';

const TaskCenterPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('assigned');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const tabs = [
    {
      id: 'assigned' as TabType,
      label: 'Nhiệm vụ Đã giao',
      icon: ListTodo,
      count: 12,
    },
    {
      id: 'library' as TabType,
      label: 'Thư viện Nhiệm vụ',
      icon: Library,
      count: 24,
    },
  ];

  return (
    <div className="min-h-screen overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Task Center 📋
            </h1>
            <p className="text-gray-600">
              Manage and create tasks to help your children develop great habits
            </p>
          </div>
          
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus className="w-5 h-5" />}
            className="shrink-0"
          >
            Tạo Nhiệm vụ Mới
          </Button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-all relative whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'text-accent-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  <Badge 
                    variant={activeTab === tab.id ? 'primary' : 'default'}
                    size="sm"
                  >
                    {tab.count}
                  </Badge>
                  
                  {/* Active indicator */}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-accent" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="animate-fade-in">
              {activeTab === 'assigned' ? (
                <AssignedTasksTab />
              ) : (
                <TaskLibraryTab />
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

export default TaskCenterPage;
