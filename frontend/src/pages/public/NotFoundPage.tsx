import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-purple-100 to-pink-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-2xl w-full relative z-10 animate-fade-in">
        {/* 404 Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6 animate-bounce-soft">
            <div className="text-9xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              404
            </div>
          </div>
          
          {/* Sad Robot Emoji */}
          <div className="text-8xl mb-6 animate-bounce-soft" style={{ animationDelay: '0.2s' }}>
            🤖💔
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          
          <p className="text-xl text-gray-700 mb-8 max-w-lg mx-auto">
            Looks like this page went on a little adventure and got lost. 
            Don't worry, we'll help you find your way back!
          </p>
        </div>

        {/* Action Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-strong p-8 border border-white/50">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">
              What would you like to do?
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Go Back Button */}
              <Button
                fullWidth
                variant="secondary"
                size="lg"
                onClick={() => navigate(-1)}
                icon={<ArrowLeft className="w-5 h-5" />}
                className="shadow-soft hover:shadow-medium active:scale-95 transition-all duration-300"
              >
                Go Back
              </Button>

              {/* Home Button */}
              <Button
                fullWidth
                variant="primary"
                size="lg"
                onClick={() => navigate('/')}
                icon={<Home className="w-5 h-5" />}
                className="shadow-soft hover:shadow-strong active:scale-95 transition-all duration-300"
              >
                Go Home
              </Button>
            </div>

            {/* Search Suggestion */}
            <div className="mt-6 p-4 bg-linear-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl border border-blue-200 shadow-soft">
              <div className="flex items-start gap-3">
                <Search className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Looking for something specific?
                  </p>
                  <p className="text-sm text-gray-700">
                    Try visiting our homepage or contact support if you need assistance.
                  </p>
                </div>
              </div>
            </div>

            {/* Common Links */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                Popular Pages:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 shadow-soft hover:shadow-medium active:scale-95 transition-all duration-300"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 shadow-soft hover:shadow-medium active:scale-95 transition-all duration-300"
                >
                  Register
                </button>
                <button
                  onClick={() => navigate('/#features')}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 shadow-soft hover:shadow-medium active:scale-95 transition-all duration-300"
                >
                  Features
                </button>
                <button
                  onClick={() => navigate('/#pricing')}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 shadow-soft hover:shadow-medium active:scale-95 transition-all duration-300"
                >
                  Pricing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 italic">
            "Even the best adventurers take wrong turns sometimes!" 🗺️✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
