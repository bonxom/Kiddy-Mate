import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const HowItWorksSection = () => {
  const steps = [
    {
      step: '1',
      title: 'Tạo nhiệm vụ',
      description: 'Thiết lập các nhiệm vụ được cá nhân hóa phù hợp với độ tuổi và khả năng của bé',
      videoSrc: '/demo_task.mp4',
    },
    {
      step: '2',
      title: 'Theo dõi tiến độ',
      description: 'Theo dõi thời gian hoàn thành, cảm xúc và sự phát triển kỹ năng theo thời gian thực',
      videoSrc: '/demo_dashboard.mp4',
    },
    {
      step: '3',
      title: 'Trao phần thưởng',
      description: 'Tự động thưởng xu và cho bé đổi lấy những phần quà thật',
      videoSrc: '/demo_reward.mp4',
    },
  ];

  return (
    <section id="how-it-works" className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-100 via-purple-100 to-pink-100">
      <img
        src="/flower.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute z-30 top-30 translate-x-30 left-2 sm:left-6 w-20 sm:w-28 md:w-36 opacity-100 -rotate-12"
      />
      <img
        src="/jump.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute z-30 bottom-4 right-2 sm:right-8 w-20 sm:w-28 md:w-36 opacity-100 rotate-12"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
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

          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative animate-fade-in group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Card padding="lg" className="text-center h-full transition-all duration-300 hover:shadow-strong hover:-translate-y-2">
                {/* Demo video preview */}
                <div className="bg-linear-to-br from-blue-200 to-purple-200 p-2 rounded-3xl w-full mb-6 shadow-medium transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-glow-accent">
                  <video
                    className="w-full h-44 sm:h-52 rounded-2xl object-cover"
                    src={step.videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
