import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X } from 'lucide-react';
import Button from '../../components/ui/Button';

const LandingNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Handle scroll for navbar transparency
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 
          ? 'bg-white/90 backdrop-blur-lg shadow-medium' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-accent">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-linear-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Kiddy-Mate
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Reviews
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button onClick={() => navigate('/register')}>
              Sign Up Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-slide-down">
          <div className="px-4 py-6 space-y-4">
            <a href="#features" className="block text-gray-700 hover:text-primary-600 font-medium">
              Features
            </a>
            <a href="#how-it-works" className="block text-gray-700 hover:text-primary-600 font-medium">
              How It Works
            </a>
            <a href="#pricing" className="block text-gray-700 hover:text-primary-600 font-medium">
              Pricing
            </a>
            <a href="#testimonials" className="block text-gray-700 hover:text-primary-600 font-medium">
              Reviews
            </a>
            <div className="pt-4 space-y-3 border-t border-gray-100">
              <Button variant="ghost" fullWidth onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button fullWidth onClick={() => navigate('/register')}>
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
