import { type InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  success?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    fullWidth = false, 
    success = false, 
    icon,
    iconPosition = 'left', 
    className = '', 
    type = 'text', 
    required, 
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const widthStyle = fullWidth ? 'w-full' : '';
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const hasLeftIcon = !!icon && iconPosition === 'left';
    const hasRightIcon = !!icon && iconPosition === 'right';
    
    const hasRightAccessory = isPassword || hasRightIcon || !!error || !!success;

    const accessoryClass = "absolute right-0 inset-y-0 flex items-center pr-3";
    
    return (
      <div className={`${widthStyle}`}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          
          {/* --- ICON BÊN TRÁI --- */}
          {hasLeftIcon && (
            <div className="absolute left-0 inset-y-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={`
              px-4 py-2.5 border rounded-xl text-base bg-white
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
              disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500
              placeholder:text-gray-400
                
              ${hasLeftIcon ? 'pl-10' : ''}
              ${hasRightAccessory ? 'pr-12' : 'pr-4'} 
              
              ${widthStyle}
              ${className}
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : success ? 'border-success-300 focus:border-success-500 focus:ring-success-500/50' : 'border-gray-200 hover:border-gray-300'}
            `}
            {...props}
          />

          {(isPassword || hasRightIcon || error || success) && (
            // Accessory container dùng flex để căn giữa dọc (inset-y-0 + items-center)
            <div className={accessoryClass}>
            
              {/* Default password toggle (only if no custom icon) */}
              {isPassword && !icon && ( 
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  // Đảm bảo không có padding xung quanh nút
                  className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-0"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              )}
              
              {/* Custom icon on right (including toggle from PasswordInput) */}
              {hasRightIcon && (
                <div className="text-gray-400">
                  {icon}
                </div>
              )}

              {/* Error and success icons */}
              {error && !isPassword && !icon && (
                <div className="text-red-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              {success && !error && !isPassword && !icon && (
                <div className="text-success-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
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