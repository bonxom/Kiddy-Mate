import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, LogIn } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import type { LoginCredentials } from '../../types/auth.types';

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // TODO: Implement API call
      console.log('Login:', credentials);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      navigate('/parent/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ email: 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-purple-100 to-pink-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 shadow-glow-accent mb-4 animate-bounce-soft">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent mb-3">
            Welcome Back! 👋
          </h1>
          <p className="text-lg text-gray-700 font-medium">
            Sign in to continue your parenting journey
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-strong p-8 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <Input
              label="Email"
              type="email"
              value={credentials.email}
              onChange={(e) => {
                setCredentials({ ...credentials, email: e.target.value });
                setErrors({ ...errors, email: '' });
              }}
              placeholder="parent@example.com"
              error={errors.email}
              icon={<Mail className="w-5 h-5 text-gray-400" />}
              fullWidth
              autoComplete="email"
            />

            {/* Password */}
            <PasswordInput
              label="Password"
              value={credentials.password}
              onChange={(e) => {
                setCredentials({ ...credentials, password: e.target.value });
                setErrors({ ...errors, password: '' });
              }}
              placeholder="Enter your password"
              error={errors.password}
              fullWidth
              autoComplete="current-password"
            />

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isLoading}
              icon={<LogIn className="w-5 h-5" />}
              className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-glow-accent hover:shadow-glow-accent hover:scale-105 transition-all duration-300"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center p-4 bg-linear-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-blue-100">
            <span className="text-gray-700 font-medium">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-transparent bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text font-bold underline underline-offset-2 decoration-2 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all"
              >
                Sign Up Now →
              </button>
            </span>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-soft hover:shadow-medium transition-all"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
