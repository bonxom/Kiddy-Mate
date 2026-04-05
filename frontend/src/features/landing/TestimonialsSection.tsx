import { Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Hồ Minh Hiếu',
      role: 'Bố của 1 bé',
      avatar: 'S',
      avatarGradient: 'bg-linear-to-br from-pink-500 to-rose-600',
      rating: 5,
      text: 'Giải pháp này đã thay đổi cách con tôi suy nghĩ, con tôi trở nên kiên nhẫn hơn, biết bày tỏ cảm xúc với bố mẹ. Tôi đánh giá rất cao KiddyMate.',
    },
    {
      name: 'Gia Linh',
      role: 'Mẹ của 3 bé',
      avatar: 'J',
      avatarGradient: 'bg-linear-to-br from-blue-500 to-indigo-600',
      rating: 5,
      text: 'Cuối cùng cũng có một giải pháp thực sự hiệu quả! Bảng điều khiển giúp tôi biết bé nào đang cần được động viên thêm.',
    },
    {
      name: 'Đức Lưu',
      role: 'Bố của 1 bé',
      avatar: 'L',
      avatarGradient: 'bg-linear-to-br from-purple-500 to-violet-600',
      rating: 5,
      text: 'Tính năng theo dõi cảm xúc thật sự tuyệt vời. Tôi có thể nhận ra lúc con căng thẳng để điều chỉnh nhiệm vụ phù hợp.',
    },
  ];

  return (
    <section id="testimonials" className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-amber-50 via-orange-50 to-pink-50">
      <img
        src="/lay.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute z-30 -top-10 translate-y-50 right-2 sm:right-40 w-24 sm:w-32 md:w-44 opacity-100 rotate-6"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="success" className="mb-4">
            Phản hồi thực tế
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Phụ huynh đang nói gì
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kiddy-Mate đang được tin tưởng bởi cộng đồng
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
