import { Target, Brain, Trophy } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const HowItWorksSection = () => {
  const steps = [
    {
      step: '1',
      title: 'Create Tasks',
      description: 'Set up personalized tasks tailored to your child\'s age and abilities',
      icon: Target,
    },
    {
      step: '2',
      title: 'Track Progress',
      description: 'Monitor real-time completion, emotions, and skill development',
      icon: Brain,
    },
    {
      step: '3',
      title: 'Reward Success',
      description: 'Auto-reward with stars and let kids redeem for real prizes',
      icon: Trophy,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="info" className="mb-4">
            Simple Process
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Get Started in 3 Easy Steps
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Setting up Kiddy-Mate takes less than 5 minutes
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
                className="relative animate-fade-in"
              >
                <Card padding="lg" className="text-center h-full">
                  {/* Icon - Larger and more prominent */}
                  <div className="bg-linear-to-br from-blue-200 to-purple-200 p-6 rounded-3xl w-fit mx-auto mb-6 shadow-medium">
                    <Icon className="w-14 h-14 text-primary-600" />
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
