import { BarChart3, Gift, Zap, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const FeaturesSection = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Bảng điều khiển thông minh',
      description: 'Theo dõi tiến độ theo thời gian thực với biểu đồ trực quan và phân tích riêng cho từng bé',
      iconBg: 'bg-linear-to-br from-blue-100 to-blue-200',
      iconColor: 'text-blue-700',
      cardGradient: 'hover:bg-linear-to-br hover:from-blue-50 hover:to-transparent',
    },
    {
      icon: Zap,
      title: 'Trò chơi hóa',
      description: 'Biến những nhiệm vụ nhàm chán thành hành trình thú vị với xu, cấp độ và thành tích',
      iconBg: 'bg-linear-to-br from-purple-100 to-purple-200',
      iconColor: 'text-purple-700',
      cardGradient: 'hover:bg-linear-to-br hover:from-purple-50 hover:to-transparent',
    },
    {
      icon: Gift,
      title: 'Cửa hàng phần thưởng',
      description: 'Hệ thống phần thưởng linh hoạt giúp bé có động lực hoàn thành nhiệm vụ và xây dựng thói quen',
      iconBg: 'bg-linear-to-br from-amber-100 to-yellow-200',
      iconColor: 'text-amber-700',
      cardGradient: 'hover:bg-linear-to-br hover:from-yellow-50 hover:to-transparent',
    },
    {
      icon: TrendingUp,
      title: 'Phát triển kỹ năng',
      description: 'Theo dõi sự tiến bộ ở 6 lĩnh vực chính: Logic, Sáng tạo, Thể chất, Xã hội, Tự lập và Học thuật',
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
            Tính năng
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Vì sao phụ huynh yêu thích Kiddy-Mate
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mọi thứ bạn cần để biến nếp sinh hoạt hằng ngày của gia đình thành một trải nghiệm đầy hứng thú
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
