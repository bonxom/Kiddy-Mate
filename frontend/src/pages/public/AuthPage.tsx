import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Sparkles, LogIn, UserPlus, Lock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import { useAuth } from '../../providers/AuthProvider';
import type { LoginCredentials, RegisterCredentials } from '../../types/auth.types';

type AuthMode = 'login' | 'register';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  
  const initialMode = location.pathname === '/register' ? 'register' : 'login';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const newMode = location.pathname === '/register' ? 'register' : 'login';
    setMode(newMode);
  }, [location.pathname]);

  // --- State & Validation (Giữ nguyên logic cũ của bạn) ---
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<Partial<LoginCredentials>>({});
  const [registerCredentials, setRegisterCredentials] = useState<RegisterCredentials>({ email: '', password: '', confirmPassword: '', displayName: '' });
  const [registerErrors, setRegisterErrors] = useState<Partial<RegisterCredentials>>({});

  const validateLoginForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};
    
    if (!loginCredentials.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginCredentials.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!loginCredentials.password) {
      errors.password = 'Password is required';
    } else if (loginCredentials.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const validateRegisterForm = (): boolean => {
    const errors: Partial<RegisterCredentials> = {};
    
    if (!registerCredentials.displayName.trim()) {
      errors.displayName = 'Full name is required';
    }
    
    if (!registerCredentials.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerCredentials.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!registerCredentials.password) {
      errors.password = 'Password is required';
    } else if (registerCredentials.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (registerCredentials.confirmPassword !== registerCredentials.password) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Handlers ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      await login(loginCredentials);
      
      // Redirect to parent dashboard after successful login
      navigate('/parent/dashboard', { replace: true });
    } catch (error: any) {
      const errorMessage = error?.message || 'Login failed. Please try again.';
      setLoginErrors({ password: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      await register({
        email: registerCredentials.email,
        password: registerCredentials.password,
        displayName: registerCredentials.displayName,
      });
      
      // Redirect to onboarding after successful registration
      navigate('/onboarding', { replace: true });
    } catch (error: any) {
      const errorMessage = error?.message || 'Registration failed. Please try again.';
      setRegisterErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setLoginErrors({});
    setRegisterErrors({});
    
    // Dùng navigate hoặc setMode trực tiếp để test UI nhanh hơn
    setMode(newMode);
    navigate(newMode === 'login' ? '/login' : '/register', { replace: true });
    
    setTimeout(() => setIsAnimating(false), 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-10 relative overflow-hidden">
      {/* --- Background Decoration (Dùng màu cứng thay vì custom class để đảm bảo hiện) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-[50%] h-[50%] bg-blue-500 rounded-full blur-[100px] opacity-30" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-purple-500 rounded-full blur-[100px] opacity-20" />
      </div>

      {/* --- Main Card --- */}
      <div className="relative bg-white rounded-4xl shadow-2xl w-full max-w-[1000px] min-h-[650px] overflow-hidden flex flex-col md:flex-row z-10">
        
        {/* HEADER MOBILE */}
        <div className="md:hidden p-6 pb-0 text-center">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#06325a] mb-2">
                <Sparkles className="w-6 h-6 text-white" />
             </div>
             <h1 className="text-2xl font-bold text-[#06325a]">Kiddy-Mate</h1>
        </div>

        {/* =========================================
            LEFT SIDE: LOGIN FORM
           ========================================= */}
        <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center transition-all duration-700 absolute md:relative top-0 left-0 h-full bg-white
            ${mode === 'login' 
                ? 'z-10 opacity-100 translate-x-0 pointer-events-auto' 
                : 'z-0 opacity-0 pointer-events-none' // Xóa translate để tránh lỗi render chồng
            }
            ${mode === 'register' && 'hidden md:flex'} 
        `}>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#06325a] mb-2">Sign In</h2>
                <p className="text-gray-500">Welcome back! Please login to continue.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5 relative z-10">
                <div>
                  <Input
                      label="Email"
                      type="email"
                      value={loginCredentials.email}
                      onChange={(e) => {
                        setLoginCredentials({ ...loginCredentials, email: e.target.value });
                        if (loginErrors.email) setLoginErrors({ ...loginErrors, email: undefined });
                      }}
                      placeholder="parent@example.com"
                      fullWidth
                      className="bg-gray-50"
                  />
                  {loginErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{loginErrors.email}</p>
                  )}
                </div>
                <div>
                  <PasswordInput
                      label="Password"
                      value={loginCredentials.password}
                      onChange={(e) => {
                        setLoginCredentials({ ...loginCredentials, password: e.target.value });
                        if (loginErrors.password) setLoginErrors({ ...loginErrors, password: undefined });
                      }}
                      placeholder="••••••••"
                      fullWidth
                      className="bg-gray-50"
                  />
                  {loginErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{loginErrors.password}</p>
                  )}
                </div>
                
                <div className="flex justify-between items-center text-sm">
                    <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-[#06325a]" />
                        Remember me
                    </label>
                    <Link to="/forgot-password" className="text-[#3498db] font-semibold">
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={isLoading}
                    // Dùng style cứng để đảm bảo màu
                    className="bg-[#06325a] hover:bg-[#052848] text-white transition-all rounded-xl py-3 shadow-lg hover:shadow-xl"
                    icon={<LogIn className="w-5 h-5" />}
                >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>
        </div>

        {/* =========================================
            RIGHT SIDE: REGISTER FORM
           ========================================= */}
        <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center transition-all duration-700 absolute md:relative top-0 right-0 h-full bg-white
            ${mode === 'register' 
                ? 'z-10 opacity-100 translate-x-0 pointer-events-auto' 
                : 'z-0 opacity-0 pointer-events-none'
            }
            ${mode === 'login' && 'hidden md:flex'}
        `}>
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#06325a] mb-2">Create Account</h2>
                <p className="text-gray-500">Join our community for parents today.</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 relative z-10">
                <div>
                  <Input
                      label="Full Name"
                      value={registerCredentials.displayName}
                      onChange={(e) => {
                        setRegisterCredentials({ ...registerCredentials, displayName: e.target.value });
                        if (registerErrors.displayName) setRegisterErrors({ ...registerErrors, displayName: undefined });
                      }}
                      placeholder="e.g. John Doe"
                      fullWidth
                      className="bg-gray-50"
                  />
                  {registerErrors.displayName && (
                    <p className="text-red-500 text-sm mt-1">{registerErrors.displayName}</p>
                  )}
                </div>
                 <div>
                   <Input
                      label="Email"
                      type="email"
                      value={registerCredentials.email}
                      onChange={(e) => {
                        setRegisterCredentials({ ...registerCredentials, email: e.target.value });
                        if (registerErrors.email) setRegisterErrors({ ...registerErrors, email: undefined });
                      }}
                      placeholder="parent@example.com"
                      fullWidth
                      className="bg-gray-50"
                   />
                   {registerErrors.email && (
                     <p className="text-red-500 text-sm mt-1">{registerErrors.email}</p>
                   )}
                 </div>
                <div>
                  <PasswordInput
                      label="Password"
                      value={registerCredentials.password}
                      onChange={(e) => {
                        setRegisterCredentials({ ...registerCredentials, password: e.target.value });
                        if (registerErrors.password) setRegisterErrors({ ...registerErrors, password: undefined });
                      }}
                      placeholder="At least 8 characters"
                      fullWidth
                      className="bg-gray-50"
                  />
                  {registerErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{registerErrors.password}</p>
                  )}
                </div>
                
                <div>
                  <PasswordInput
                      label="Confirm Password"
                      value={registerCredentials.confirmPassword || ''}
                      onChange={(e) => {
                        setRegisterCredentials({ ...registerCredentials, confirmPassword: e.target.value });
                        if (registerErrors.confirmPassword) setRegisterErrors({ ...registerErrors, confirmPassword: undefined });
                      }}
                      placeholder="Re-enter your password"
                      fullWidth
                      className="bg-gray-50"
                  />
                  {registerErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{registerErrors.confirmPassword}</p>
                  )}
                </div>
                
                <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={isLoading}
                    className="bg-[#10b981] hover:bg-[#059669] text-white transition-all rounded-xl py-3 shadow-lg hover:shadow-xl"
                    icon={<UserPlus className="w-5 h-5" />}
                >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
            </form>
        </div>

        {/* =========================================
            THE SLIDING OVERLAY (Quan trọng nhất)
           ========================================= */}
          <div 
            className={`hidden md:block absolute top-0 h-full w-[55%] transition-all duration-700 ease-in-out z-20 shadow-2xl text-white overflow-hidden
            ${mode === 'login' 
              ? 'left-1/2' // Login Mode: Overlay nằm bên phải
              : '-left-[5%]' // Register Mode: Overlay nằm bên trái
            }`}
            style={{
                // FIX 2: Màu gradient đẹp hơn, kết hợp màu thương hiệu (xanh đậm -> xanh sáng)
                background: 'linear-gradient(135deg, #06325a 0%, #3498db 100%)',
                
                // Giữ nguyên clip-path tạo vát chéo
                clipPath: mode === 'login' 
                    ? 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' // Cạnh trái vát chéo
                    : 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)'    // Cạnh phải vát chéo
            }}
         >
            {/* Overlay Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

            {/* --- CONTENT: BUTTON CHUYỂN SANG REGISTER (Hiện khi đang Login) --- */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-12 text-center transition-all duration-700 px-20
                ${mode === 'login' ? 'opacity-100 translate-x-0 delay-100 pointer-events-auto' : 'opacity-0 translate-x-[20%] pointer-events-none'}
            `}>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md mb-6 border border-white/20 shadow-lg">
                    <UserPlus className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold mb-4 text-white">New Here?</h2>
                <p className="text-blue-100 mb-8 text-lg">Join Kiddy-Mate to access AI-powered parenting insights!</p>
                
                {/* FIX 3: Button có z-index cao và cursor-pointer */}
                <button 
                    onClick={() => switchMode('register')}
                    className="relative z-50 bg-white text-[#06325a] hover:bg-blue-50 rounded-full px-10 py-3 font-bold text-lg shadow-lg transform transition hover:scale-105 cursor-pointer"
                >
                    Sign Up Now
                </button>
            </div>

            {/* --- CONTENT: BUTTON CHUYỂN SANG LOGIN (Hiện khi đang Register) --- */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-12 text-center transition-all duration-700 px-20
                ${mode === 'register' ? 'opacity-100 translate-x-0 delay-100 pointer-events-auto' : 'opacity-0 -translate-x-[20%] pointer-events-none'}
            `}>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md mb-6 border border-white/20 shadow-lg">
                    <Lock className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold mb-4 text-white">Welcome Back!</h2>
                <p className="text-blue-100 mb-8 text-lg">Already have an account? Sign in to continue.</p>
                
                {/* FIX 3: Button có z-index cao và cursor-pointer */}
                <button 
                    onClick={() => switchMode('login')}
                    className="relative z-50 bg-white text-[#06325a] hover:bg-blue-50 rounded-full px-10 py-3 font-bold text-lg shadow-lg transform transition hover:scale-105 cursor-pointer"
                >
                    Sign In
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;