import { type InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  success?: boolean;
  icon?: React.ReactNode; // Icon tùy chỉnh
  iconPosition?: 'left' | 'right'; // Vị trí của icon
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
    
    // Xác định có cần padding bên phải cho icon/nút toggle không
    const hasRightAccessory = isPassword || hasRightIcon || !!error || !!success;

    // Xác định vị trí tuyệt đối của phụ kiện bên phải.
    // Dùng 'inset-y-0' (top: 0, bottom: 0) và flexbox để căn giữa hoàn hảo
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
              
              /* Padding Left */
              ${hasLeftIcon ? 'pl-10' : ''}
              
              /* Padding Right: Tăng pr-10 lên pr-12 để chừa chỗ cho accessory căn giữa */
              ${hasRightAccessory ? 'pr-12' : 'pr-4'} 
              
              ${widthStyle}
              ${className}
              
              /* Màu sắc theo trạng thái */
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : success ? 'border-success-300 focus:border-success-500 focus:ring-success-500/50' : 'border-gray-200 hover:border-gray-300'}
            `}
            {...props}
          />

          {/* =========================================================
              CÁC ICON VÀ NÚT BÊN PHẢI (Right Accessories)
              ========================================================= */}

          {(isPassword || hasRightIcon || error || success) && (
            // Accessory container dùng flex để căn giữa dọc (inset-y-0 + items-center)
            <div className={accessoryClass}>
            
              {/* 1. Nút Ẩn/Hiện Mật khẩu MẶC ĐỊNH (Chỉ khi KHÔNG có icon tùy chỉnh) */}
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
              
              {/* 2. Icon custom ở bên phải (bao gồm cả nút toggle từ PasswordInput.tsx) */}
              {hasRightIcon && (
                <div className="text-gray-400">
                  {icon}
                </div>
              )}

              {/* 3. Error and success icons (Chỉ hiển thị nếu KHÔNG có password toggle hoặc icon tùy chỉnh) */}
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