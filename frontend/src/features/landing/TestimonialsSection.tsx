import { Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Mẹ của 2 bé',
      avatar: 'S',
      avatarGradient: 'bg-linear-to-br from-pink-500 to-rose-600',
      rating: 5,
      text: 'Thật sự thay đổi cuộc chơi! Giờ các con mình còn chủ động xin làm việc nhà. Hệ thống xu đúng là phép màu! ✨',
    },
    {
      name: 'John Davis',
      role: 'Bố của 3 bé',
      avatar: 'J',
      avatarGradient: 'bg-linear-to-br from-blue-500 to-indigo-600',
      rating: 5,
      text: 'Cuối cùng cũng có một giải pháp thực sự hiệu quả! Bảng điều khiển giúp tôi biết bé nào đang cần được động viên thêm.',
    },
    {
      name: 'Lisa Chen',
      role: 'Mẹ của 1 bé',
      avatar: 'L',
      avatarGradient: 'bg-linear-to-br from-purple-500 to-violet-600',
      rating: 5,
      text: 'Tính năng theo dõi cảm xúc thật sự tuyệt vời. Tôi có thể nhận ra lúc con căng thẳng để điều chỉnh nhiệm vụ phù hợp.',
    },
  ];

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-amber-50 via-orange-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="success" className="mb-4">
            Phản hồi thực tế
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Phụ huynh đang nói gì
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tham gia cùng hàng nghìn gia đình đang sử dụng Kiddy-Mate mỗi ngày
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              padding="lg" 
              hover
              className="animate-fade-in bg-white/80 backdrop-blur-sm"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${testimonial.avatarGradient} flex items-center justify-center text-white font-bold text-lg shadow-medium`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
