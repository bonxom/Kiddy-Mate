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
    primary: 'bg-gradient-accent text-white hover:shadow-glow-accent focus:ring-accent-400 border border-accent-600',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300 border border-gray-200',
    danger: 'bg-gradient-danger text-white hover:shadow-glow focus:ring-red-400 border border-red-600',
    success: 'bg-gradient-success text-white hover:shadow-glow-success focus:ring-success-400 border border-success-600',
    warning: 'bg-gradient-warning text-white hover:shadow-glow focus:ring-warning-400 border border-warning-600',
    outline: 'border-2 border-accent text-accent bg-white hover:bg-accent hover:text-white focus:ring-accent',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300 border border-transparent',
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
