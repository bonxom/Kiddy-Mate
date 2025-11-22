import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { loginChild } from '../../api/services/childAuthService';
import { STORAGE_KEYS } from '../../api/client/apiConfig';

const ChildLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginChild({ username, password });
      
      // Store child auth data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify({
        id: response.child_id,
        name: response.child_name,
        role: 'child',
        username: username
      }));

      // Navigate to child dashboard
      navigate('/child/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-pink-500 mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back! 🎉
          </h1>
          <p className="text-gray-600">Login to your Kiddy-Mate account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            icon={<User className="w-5 h-5 text-purple-500" />}
            fullWidth
            className="py-3 text-base"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            icon={<Lock className="w-5 h-5 text-purple-500" />}
            fullWidth
            className="py-3 text-base"
            required
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            icon={<ArrowRight className="w-5 h-5" />}
            className="bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account? Ask your parent to create one!
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-2 text-sm font-semibold text-purple-600 hover:text-purple-700"
          >
            Parent Login →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChildLoginPage;
