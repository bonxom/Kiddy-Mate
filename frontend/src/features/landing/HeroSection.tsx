import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Sparkles, Star, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import RobotCanvasLazy from '../../components/common/RobotCanvasLazy';

const HeroSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // Auto-hide scroll indicator when section is out of viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Hide indicator when less than 20% of section is visible
        setShowScrollIndicator(entry.intersectionRatio > 0.2);
      },
      {
        threshold: [0, 0.2, 0.5, 1],
        rootMargin: '0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative flex items-center overflow-hidden bg-linear-to-br from-white via-blue-50 to-purple-100 min-h-screen"
      style={{
        // Use CSS custom property for dynamic viewport height (mobile-friendly)
        // @ts-ignore - CSS custom property not recognized by TS
        minHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      }}
    >
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: '2s' }} />
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-primary-400 rounded-full animate-bounce-soft" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-6 h-6 bg-accent-400 rounded-full animate-bounce-soft" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bounce-soft" style={{ animationDelay: '2.5s' }} />
      </div>

      {/* Main Content Container - Subtract navbar height */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-5rem)]">
          {/* Left Content */}
          <div className="flex flex-col justify-center text-center lg:text-left space-y-6 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex justify-center lg:justify-start">
              <Badge variant="primary" className="mb-2 inline-flex shadow-soft hover:shadow-medium transition-shadow">
                <Sparkles className="w-3 h-3" />
                Trusted by 10,000+ families
              </Badge>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Transform Chores into{' '}
              <span className="relative inline-block">
                <span className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse-soft">
                  Adventures
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 8 Q50 2, 100 8 T200 8" stroke="url(#gradient)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              ! 🚀
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Gamified task management for kids with AI-powered rewards. 
              Make parenting easier and childhood more fun!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                icon={<Sparkles className="w-5 h-5" />}
                className="text-lg shadow-strong hover:shadow-glow-accent hover:scale-105 transition-all duration-300 group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                icon={<Star className="w-5 h-5" />}
                className="text-lg hover:bg-primary-50 transition-all duration-300"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center lg:justify-start text-sm text-gray-600 pt-2">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span className="font-medium">14-day free trial</span>
              </div>
            </div>
          </div>

          {/* Right - 3D Robot with Adaptive Height */}
          <div className="flex items-center justify-center lg:justify-end">
            <div 
              className="w-full h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[700px] animate-fade-in" 
              style={{ animationDelay: '0.2s' }}
            >
              <div className="relative w-full h-full">
                {/* 3D Model Container - Transparent background */}
                <div className="relative w-full h-full">
                  <RobotCanvasLazy />
                </div>
                
                {/* Decorative Corner Accents - Subtle glow effect */}
                <div className="absolute top-4 right-4 w-20 h-20 border-t-4 border-r-4 border-primary-400/40 rounded-tr-3xl opacity-60 blur-sm" />
                <div className="absolute bottom-4 left-4 w-20 h-20 border-b-4 border-l-4 border-purple-400/40 rounded-bl-3xl opacity-60 blur-sm" />
                
                {/* Soft glow behind model */}
                <div className="absolute inset-0 -z-10 bg-linear-to-br from-blue-300/20 via-purple-300/20 to-pink-300/20 rounded-3xl blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Auto-hide on scroll */}
      <div 
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block transition-all duration-500 ${
          showScrollIndicator ? 'opacity-100 translate-y-0 animate-bounce' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* <div className="flex flex-col items-center gap-2 text-gray-600">
          <span className="text-sm font-semibold">Scroll to explore</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div> */}
      </div>
    </section>
  );
};

export default HeroSection;
