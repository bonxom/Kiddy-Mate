import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';
import Button from '../../components/ui/Button';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300 rounded-full blur-3xl animate-pulse-soft" />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="mb-15 animate-bounce-soft scale-200">
          <img
            src="/icon.png"
            alt="Kiddy-Mate icon"
            className="w-20 h-20 mx-auto object-contain"
          />
        </div>
        
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
          Một hành trình được cá nhân hóa cho trẻ
        </h2>
        
        <p className="text-xl mb-8 text-blue-100">
          Tham gia cùng Kiddy-Mate để biến việc nuôi dạy con trở nên nhẹ nhàng và vui vẻ hơn bao giờ hết
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/register')}
            icon={<Sparkles className="w-5 h-5" />}
            className="text-lg shadow-soft hover:shadow-strong active:scale-95 transition-all duration-300"
          >
            Bắt đầu dùng thử miễn phí
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 shadow-soft hover:shadow-medium active:scale-95 transition-all duration-300"
            icon={<Heart className="w-5 h-5" />}
          >
            Đặt lịch xem demo
          </Button>
        </div>

      </div>
    </section>
  );
};

export default CTASection;
