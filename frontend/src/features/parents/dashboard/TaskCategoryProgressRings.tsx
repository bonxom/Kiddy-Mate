import { useState } from 'react';
import { Target, Brain, Dumbbell, Palette, Users, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface TaskCategory {
  name: string;
  icon: React.ElementType;
  completed: number;
  total: number;
  color: string;
  bgColor: string;
}

const TaskProgressRings = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const allCategories: TaskCategory[] = [
    {
      name: 'Independence',
      icon: Target,
      completed: 8,
      total: 10,
      color: '#3b82f6',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Logic',
      icon: Brain,
      completed: 6,
      total: 10,
      color: '#8b5cf6',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Physical',
      icon: Dumbbell,
      completed: 9,
      total: 10,
      color: '#10b981',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Creativity',
      icon: Palette,
      completed: 7,
      total: 10,
      color: '#ec4899',
      bgColor: 'bg-pink-50',
    },
    {
      name: 'Social',
      icon: Users,
      completed: 5,
      total: 10,
      color: '#f59e0b',
      bgColor: 'bg-amber-50',
    },
    {
      name: 'Academic',
      icon: BookOpen,
      completed: 8,
      total: 10,
      color: '#6366f1',
      bgColor: 'bg-indigo-50',
    },
  ];

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
        
        <div className="flex items-center gap-1">
          {/* Navigation buttons */}
          <button
            onClick={goToPreviousPage}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
          </button>
          <button
            onClick={goToNextPage}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4" style={{ height: '276px' }}>
        {categories.map((category, index) => {
          const percentage = calculatePercentage(category.completed, category.total);
          const { circumference, offset } = getCircleProgress(percentage);
          const Icon = category.icon;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={category.name}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Progress Ring */}
              <div className="relative shrink-0">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  {/* Background circle */}
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                  />
                  {/* Progress circle */}
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
                
                {/* Icon in center */}
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
                
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
                
                {/* Stats */}
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
