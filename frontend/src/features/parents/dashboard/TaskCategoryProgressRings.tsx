import { useState } from 'react';
import type { ElementType } from 'react'; 
import { Target, Brain, Dumbbell, Palette, Users, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CategoryProgressData } from '../../../api/services/dashboardService';

interface CategoryConfigItem {
  color: string;
  bgColor: string;
  icon: ElementType; // Dùng ElementType thay vì React.ElementType
}

interface TaskCategory {
  name: string;
  icon: ElementType;
  completed: number;
  total: number;
  color: string;
  bgColor: string;
}

interface TaskProgressRingsProps {
  data: CategoryProgressData[];
}

const TaskProgressRings = ({ data }: TaskProgressRingsProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // 3. Khai báo kiểu tường minh: Record<string, CategoryConfigItem>
  const categoryConfig: Record<string, CategoryConfigItem> = {
    Focus: { color: '#3b82f6', bgColor: 'bg-blue-50', icon: Target },
    Logic: { color: '#8b5cf6', bgColor: 'bg-purple-50', icon: Brain },
    Physical: { color: '#10b981', bgColor: 'bg-green-50', icon: Dumbbell },
    Creativity: { color: '#ec4899', bgColor: 'bg-pink-50', icon: Palette },
    Social: { color: '#f59e0b', bgColor: 'bg-amber-50', icon: Users },
    Academic: { color: '#6366f1', bgColor: 'bg-indigo-50', icon: BookOpen },
  };

  const allCategories: TaskCategory[] = data.map((cat) => ({
    name: cat.name,
    completed: cat.completed,
    total: cat.total,
    // Dùng Optional Chaining và Fallback an toàn
    color: categoryConfig[cat.name]?.color || '#6b7280',
    bgColor: categoryConfig[cat.name]?.bgColor || 'bg-gray-50',
    icon: categoryConfig[cat.name]?.icon || Target,
  }));

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(allCategories.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const categories = allCategories.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const calculatePercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getCircleProgress = (percentage: number) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return { circumference, offset };
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      {/* Header with navigation */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Task Progress by Category
          </h3>
          <p className="text-sm text-gray-600">Completion rates across skill areas</p>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); goToPreviousPage(); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNextPage(); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
            </button>
          </div>
        )}
      </div>
      
      <div className="space-y-4" style={{ minHeight: '276px' }}>
        {categories.map((category, index) => {
          const percentage = calculatePercentage(category.completed, category.total);
          const { circumference, offset } = getCircleProgress(percentage);
          const Icon = category.icon as any;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={`${category.name}-${index}`}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Progress Ring */}
              <div className="relative shrink-0">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke={category.color}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.5s ease, stroke-width 0.2s ease',
                      strokeWidth: isHovered ? '7' : '6',
                    }}
                  />
                </svg>
                
                <div className={`absolute inset-0 flex items-center justify-center ${category.bgColor} rounded-full m-2 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon 
                    className="w-5 h-5" 
                    style={{ color: category.color }}
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {category.name}
                  </h4>
                  <span 
                    className="text-sm font-bold ml-2"
                    style={{ color: category.color }}
                  >
                    {percentage}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
                
                <p className="text-xs text-gray-500 mt-1.5">
                  {category.completed} of {category.total} tasks completed
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskProgressRings;