import { useNavigate } from 'react-router-dom';
import { Trophy, Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-primary-700 via-blue-700 to-accent-600 text-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400 rounded-full blur-3xl animate-pulse-soft" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="mb-8 animate-bounce-soft">
          <Trophy className="w-20 h-20 mx-auto text-yellow-300" />
        </div>
        
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
          Ready to Transform Your Family Life? 🎉
        </h2>
        
        <p className="text-xl mb-8 text-blue-100">
          Join thousands of families who have made parenting easier and childhood more fun
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/register')}
            icon={<Sparkles className="w-5 h-5" />}
            className="text-lg shadow-soft hover:shadow-strong active:scale-95 transition-all duration-300"
          >
            Start Your Free Trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 shadow-soft hover:shadow-medium active:scale-95 transition-all duration-300"
            icon={<Heart className="w-5 h-5" />}
          >
            Schedule a Demo
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
