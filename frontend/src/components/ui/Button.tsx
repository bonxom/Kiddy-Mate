import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 btn-ripple shadow-soft hover:shadow-medium';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-glow-accent focus:ring-blue-400 border border-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:text-gray-950 focus:ring-gray-300 border border-gray-200',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 hover:shadow-glow focus:ring-red-400 border border-red-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-glow-success focus:ring-green-400 border border-green-500',
    warning: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600 hover:text-gray-950 focus:ring-yellow-400 border border-yellow-400',
    outline: 'border-2 border-blue-500 text-blue-600 bg-white hover:bg-blue-500 hover:text-white focus:ring-blue-400',
    ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-950 focus:ring-gray-300 border border-transparent',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-5 py-2.5 text-base min-h-[40px]',
    lg: 'px-7 py-3.5 text-lg min-h-[48px]',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
