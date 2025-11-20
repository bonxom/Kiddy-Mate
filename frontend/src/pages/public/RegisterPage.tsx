import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, User, UserPlus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import { useAuth } from '../../providers/AuthProvider';
import type { RegisterCredentials } from '../../types/auth.types';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterCredentials>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterCredentials> = {};

    if (!credentials.displayName) {
      newErrors.displayName = 'Display name is required';
    } else if (credentials.displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!credentials.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (credentials.password !== credentials.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Call API through AuthProvider
      await register({
        email: credentials.email,
        password: credentials.password,
        displayName: credentials.displayName,
      });
      
      // Navigate to onboarding flow
      navigate('/onboarding');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Show error message
      const errorMessage = error instanceof Error ? error.message : 'Email already exists';
      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-purple-100 to-pink-200 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 shadow-glow-accent mb-4 animate-bounce-soft">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent mb-3">
            Join Kiddy-Mate! 🚀
          </h1>
          <p className="text-lg text-gray-700 font-medium">
            Start your journey to better parenting
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-strong p-8 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name */}
            <Input
              label="Display Name"
              type="text"
              value={credentials.displayName}
              onChange={(e) => {
                setCredentials({ ...credentials, displayName: e.target.value });
                setErrors({ ...errors, displayName: '' });
              }}
              placeholder="e.g., Parent of Emma"
              error={errors.displayName}
              icon={<User className="w-5 h-5 text-gray-400" />}
              fullWidth
              autoComplete="name"
            />

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
              placeholder="At least 8 characters"
              error={errors.password}
              fullWidth
              autoComplete="new-password"
              showStrengthIndicator={true}
            />

            {/* Confirm Password */}
            <PasswordInput
              label="Confirm Password"
              value={credentials.confirmPassword}
              onChange={(e) => {
                setCredentials({ ...credentials, confirmPassword: e.target.value });
                setErrors({ ...errors, confirmPassword: '' });
              }}
              placeholder="Re-enter your password"
              error={errors.confirmPassword}
              fullWidth
              autoComplete="new-password"
            />

            {/* Terms & Conditions */}
            <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                Privacy Policy
              </Link>
            </p>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isLoading}
              icon={<UserPlus className="w-5 h-5" />}
              className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-glow-accent hover:shadow-glow-accent hover:scale-105 transition-all duration-300"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center p-4 bg-linear-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-blue-100">
            <span className="text-gray-700 font-medium">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-transparent bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text font-bold underline underline-offset-2 decoration-2 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all"
              >
                Sign In →
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

export default RegisterPage;
