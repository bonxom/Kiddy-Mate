import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import AssignedTasksTab from '../../features/parents/task-management/AssignedTasksTab';
import TaskLibraryTab from '../../features/parents/task-management/TaskLibraryTab';
import CreateTaskModal from '../../features/parents/task-management/CreateTaskModal';

type TabType = 'assigned' | 'library';

const TaskCenterPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('assigned');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="h-screen overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Task Center</h1>
          
          {/* Create Task Button */}
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tạo Nhiệm vụ Mới
          </Button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`
                px-6 py-4 text-sm font-medium transition-colors relative
                ${activeTab === 'assigned'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Nhiệm vụ Đã giao
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`
                px-6 py-4 text-sm font-medium transition-colors relative
                ${activeTab === 'library'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Thư viện Nhiệm vụ
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'assigned' ? (
              <AssignedTasksTab />
            ) : (
              <TaskLibraryTab />
            )}
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
