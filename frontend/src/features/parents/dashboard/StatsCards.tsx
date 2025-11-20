import { TrendingUp, Star, Trophy, CheckCircle } from 'lucide-react';
import type { StatsCardsData } from '../../../api/services/dashboardService';

interface StatCard {
  icon: React.ElementType;
  title: string;
  value: string;
  iconColor: string;
  bgGradient: string;
}

interface StatsCardsProps {
  data: StatsCardsData;
}

const StatsCards = ({ data }: StatsCardsProps) => {
  const stats: StatCard[] = [
    {
      icon: TrendingUp,
      title: 'Level',
      value: data.level,
      iconColor: 'text-info-600',
      bgGradient: 'bg-gradient-to-br from-info-50 to-info-100',
    },
    {
      icon: Star,
      title: 'Total Stars',
      value: data.totalStars,
      iconColor: 'text-warning-600',
      bgGradient: 'bg-gradient-to-br from-warning-50 to-warning-100',
    },
    {
      icon: Trophy,
      title: 'Achievements',
      value: data.achievements,
      iconColor: 'text-purple-600',
      bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
    },
    {
      icon: CheckCircle,
      title: 'Completion',
      value: data.completion,
      iconColor: 'text-success-600',
      bgGradient: 'bg-gradient-to-br from-success-50 to-success-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Column 1 */}
              <div className="flex flex-col gap-2">
                {/* Icon */}
                <div className={`${stat.bgGradient} p-3.5 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-9 h-9 ${stat.iconColor}`} strokeWidth={2} />
                </div>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-2 items-end justify-between">
                {/* Value */}
                <p className="text-4xl font-bold text-gray-900">
                  {stat.value}
                </p>
                
                {/* Title */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {stat.title}
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
