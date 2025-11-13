import { TrendingUp, Star, Trophy, CheckCircle } from 'lucide-react';

interface StatCard {
  icon: React.ElementType;
  title: string;
  value: string;
  iconColor: string;
  bgColor: string;
}

const StatsCards = () => {
  const stats: StatCard[] = [
    {
      icon: TrendingUp,
      title: 'Level',
      value: '12',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Star,
      title: 'Total Stars',
      value: '1,450',
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Trophy,
      title: 'Achievements',
      value: '5',
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: CheckCircle,
      title: 'Completion',
      value: '85%',
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {/* Column 1: Icon */}
              <div className={`${stat.bgColor} p-2.5 rounded-lg flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={2.5} />
              </div>
              
              {/* Column 2: Title and Value */}
              <div className="flex flex-col min-w-0">
                {/* Row 1: Title */}
                <p className="text-xs font-medium text-gray-500 mb-1">
                  {stat.title}
                </p>
                {/* Row 2: Value */}
                <p className="text-2xl font-bold text-gray-900 truncate">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
