import { BarChart3, Gift, Zap, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const FeaturesSection = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Smart Dashboard',
      description: 'Real-time progress tracking with beautiful charts and analytics for every child',
      iconBg: 'bg-linear-to-br from-blue-100 to-blue-200',
      iconColor: 'text-blue-700',
      cardGradient: 'hover:bg-linear-to-br hover:from-blue-50 hover:to-transparent',
    },
    {
      icon: Zap,
      title: 'Gamification',
      description: 'Transform boring tasks into exciting quests with stars, levels, and achievements',
      iconBg: 'bg-linear-to-br from-purple-100 to-purple-200',
      iconColor: 'text-purple-700',
      cardGradient: 'hover:bg-linear-to-br hover:from-purple-50 hover:to-transparent',
    },
    {
      icon: Gift,
      title: 'Reward Shop',
      description: 'Flexible reward system that motivates kids to complete tasks and develop habits',
      iconBg: 'bg-linear-to-br from-amber-100 to-yellow-200',
      iconColor: 'text-amber-700',
      cardGradient: 'hover:bg-linear-to-br hover:from-yellow-50 hover:to-transparent',
    },
    {
      icon: TrendingUp,
      title: 'Skill Development',
      description: 'Track growth in 6 key areas: Logic, Creativity, Physical, Social, Independence & Academic',
      iconBg: 'bg-linear-to-br from-green-100 to-emerald-200',
      iconColor: 'text-green-700',
      cardGradient: 'hover:bg-linear-to-br hover:from-green-50 hover:to-transparent',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-white via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="primary" className="mb-4">
            Features
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Why Parents Love Kiddy-Mate
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to transform your family's daily routine into an engaging experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                hover
                padding="lg"
                className={`group animate-fade-in transition-all duration-300 ${feature.cardGradient}`}
              >
                <div className={`${feature.iconBg} p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-soft`}>
                  <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
