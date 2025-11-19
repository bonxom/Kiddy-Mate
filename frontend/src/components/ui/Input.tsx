import { type InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  success?: boolean;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = false, success = false, icon, className = '', type = 'text', required, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const widthStyle = fullWidth ? 'w-full' : '';
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className={`${widthStyle}`}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`
              px-4 py-2.5 border rounded-xl text-base bg-white shadow-soft
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent focus:shadow-medium
              disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500
              placeholder:text-gray-400
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : success ? 'border-success-300 focus:border-success-500 focus:ring-success-500/50' : 'border-gray-200 hover:border-gray-300'}
              ${icon ? 'pl-10' : ''}
              ${isPassword ? 'pr-10' : ''}
              ${widthStyle}
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          {success && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
        </div>
        {error && (
          <div className="mt-1.5 flex items-center gap-1 text-sm text-red-600 animate-slide-down">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
