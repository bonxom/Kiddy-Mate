import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import type { LibraryTask, TaskCategory } from '../../../types/task.types';
import AssignTaskModal from './AssignTaskModal';

// Mock data
const mockLibraryTasks: LibraryTask[] = [
  {
    id: 'lib1',
    task: 'Đọc sách 15 phút',
    category: 'academic',
    description: 'Khuyến khích thói quen đọc sách mỗi ngày',
    suggestedReward: 8,
  },
  {
    id: 'lib2',
    task: 'Dọn dẹp phòng ngủ',
    category: 'self-discipline',
    description: 'Rèn luyện kỹ năng tự lập và giữ gìn không gian sống',
    suggestedReward: 10,
  },
  {
    id: 'lib3',
    task: 'Giải bài toán logic',
    category: 'logic',
    description: 'Phát triển tư duy logic và giải quyết vấn đề',
    suggestedReward: 12,
  },
  {
    id: 'lib4',
    task: 'Vẽ tranh tự do',
    category: 'creativity',
    description: 'Khuyến khích sự sáng tạo và thể hiện cảm xúc',
    suggestedReward: 10,
  },
  {
    id: 'lib5',
    task: 'Chơi game nhóm',
    category: 'social',
    description: 'Phát triển kỹ năng làm việc nhóm và giao tiếp',
    suggestedReward: 15,
  },
  {
    id: 'lib6',
    task: 'Tập thể dục 20 phút',
    category: 'physical',
    description: 'Rèn luyện sức khỏe thể chất',
    suggestedReward: 10,
  },
];

const categoryLabels: Record<TaskCategory, string> = {
  'self-discipline': 'Tự lập',
  logic: 'Logic',
  creativity: 'Sáng tạo',
  social: 'Xã hội',
  physical: 'Thể chất',
  academic: 'Học tập',
};

const TaskLibraryTab = () => {
  const [tasks] = useState<LibraryTask[]>(mockLibraryTasks);
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

  const getCategoryBadge = (category: TaskCategory) => {
    const categoryColors: Record<TaskCategory, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
      'self-discipline': 'info',
      logic: 'warning',
      creativity: 'danger',
      social: 'success',
      physical: 'info',
      academic: 'default',
    };

    return (
      <Badge variant={categoryColors[category]}>
        {categoryLabels[category]}
      </Badge>
    );
  };

  return (
    <div>
      {/* Search and Filter */}
      <div className="flex gap-4 mb-4">
        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm nhiệm vụ..."
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
            <option value="all">Tất cả kỹ năng</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhiệm vụ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kỹ năng
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {task.task}
                </td>
                <td className="px-4 py-3">{getCategoryBadge(task.category)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {task.description}
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    onClick={() => handleAssignClick(task)}
                  >
                    Giao nhiệm vụ
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy nhiệm vụ nào
          </div>
        )}
      </div>

      {/* Assign Task Modal */}
      {selectedTask && (
        <AssignTaskModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
        />
      )}
    </div>
  );
};

export default TaskLibraryTab;
