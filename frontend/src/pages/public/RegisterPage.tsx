import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, User, UserPlus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import type { RegisterCredentials } from '../../types/auth.types';

const RegisterPage = () => {
  const navigate = useNavigate();
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
      // TODO: Implement API call
      console.log('Register:', credentials);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to onboarding flow
      navigate('/onboarding');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ email: 'Email already exists' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow-accent mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Kiddy-Mate
          </h1>
          <p className="text-gray-600">
            Start your journey to better parenting
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-strong p-8">
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
            <p className="text-xs text-gray-600">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:underline">
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
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2 decoration-2 hover:decoration-primary-700 transition-all"
              >
                Sign In
              </button>
            </span>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
