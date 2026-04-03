import { Target, Brain, Trophy } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const HowItWorksSection = () => {
  const steps = [
    {
      step: '1',
      title: 'Tạo nhiệm vụ',
      description: 'Thiết lập các nhiệm vụ được cá nhân hóa phù hợp với độ tuổi và khả năng của bé',
      icon: Target,
    },
    {
      step: '2',
      title: 'Theo dõi tiến độ',
      description: 'Theo dõi thời gian hoàn thành, cảm xúc và sự phát triển kỹ năng theo thời gian thực',
      icon: Brain,
    },
    {
      step: '3',
      title: 'Trao phần thưởng',
      description: 'Tự động thưởng xu và cho bé đổi lấy những phần quà thật',
      icon: Trophy,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="info" className="mb-4">
            Quy trình đơn giản
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Bắt đầu chỉ với 3 bước dễ dàng
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Thiết lập Kiddy-Mate chỉ mất chưa đến 5 phút
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection Lines - Desktop Only */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-1">
            <div className="absolute left-1/6 right-1/6 h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 rounded-full" />
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className="relative animate-fade-in group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <Card padding="lg" className="text-center h-full transition-all duration-300 hover:shadow-strong hover:-translate-y-2">
                  {/* Icon - Larger and more prominent with animation */}
                  <div className="bg-linear-to-br from-blue-200 to-purple-200 p-6 rounded-3xl w-fit mx-auto mb-6 shadow-medium transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-accent animate-pulse-soft">
                    <Icon className="w-14 h-14 text-primary-600" />
                  </div>

                  {/* Step number badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-strong">
                    {step.step}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
