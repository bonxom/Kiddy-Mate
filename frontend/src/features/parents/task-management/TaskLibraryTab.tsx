import { useState, useMemo } from 'react';
import { Search, Filter, Target, Brain, Dumbbell, Palette, Users, BookOpen, Star } from 'lucide-react';
import Input from '../../../components/ui/Input';
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
    suggestedChild: 'Minh An',
  },
  {
    id: 'lib2',
    task: 'Dọn dẹp phòng ngủ',
    category: 'self-discipline',
    description: 'Rèn luyện kỹ năng tự lập và giữ gìn không gian sống',
    suggestedReward: 10,
    suggestedChild: 'Thu Hà',
  },
  {
    id: 'lib3',
    task: 'Giải bài toán logic',
    category: 'logic',
    description: 'Phát triển tư duy logic và giải quyết vấn đề',
    suggestedReward: 12,
    suggestedChild: 'Minh An',
  },
  {
    id: 'lib4',
    task: 'Vẽ tranh tự do',
    category: 'creativity',
    description: 'Khuyến khích sự sáng tạo và thể hiện cảm xúc',
    suggestedReward: 10,
    suggestedChild: 'Thu Hà',
  },
  {
    id: 'lib5',
    task: 'Chơi game nhóm',
    category: 'social',
    description: 'Phát triển kỹ năng làm việc nhóm và giao tiếp',
    suggestedReward: 15,
    suggestedChild: 'Minh An',
  },
  {
    id: 'lib6',
    task: 'Tập thể dục 20 phút',
    category: 'physical',
    description: 'Rèn luyện sức khỏe thể chất',
    suggestedReward: 10,
    suggestedChild: 'Thu Hà',
  },
];

const categoryLabels: Record<TaskCategory, string> = {
  'self-discipline': 'Independence',
  logic: 'Logic',
  creativity: 'Creativity',
  social: 'Social',
  physical: 'Physical',
  academic: 'Academic',
};

const TaskLibraryTab = () => {
  const [tasks] = useState<LibraryTask[]>(mockLibraryTasks);

  const getCategoryIcon = (category: TaskCategory) => {
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

  const getCategoryColor = (category: TaskCategory) => {
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
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 hover:scale-105 ${getCategoryColor(category)}`}>
        {getCategoryIcon(category)}
        <span>{categoryLabels[category]}</span>
      </div>
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
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-md">
        <table className="w-full">
          <thead style={{ background: 'linear-gradient(to right, rgb(249 250 251), rgb(243 244 246))' }}>
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
                <td className="px-4 py-4">{getCategoryBadge(task.category)}</td>
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
          <div className="text-center py-8 text-gray-500">
            No tasks found
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
