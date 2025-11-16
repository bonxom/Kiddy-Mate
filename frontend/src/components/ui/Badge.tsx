import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  pulse = false,
}: BadgeProps) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-success-50 text-success-800 border-success-200',
    warning: 'bg-warning-50 text-warning-800 border-warning-200',
    danger: 'bg-danger-50 text-danger-800 border-danger-200',
    info: 'bg-info-50 text-info-800 border-info-200',
    primary: 'bg-primary-50 text-primary-800 border-primary-200',
  };

  const dotColors = {
    default: 'bg-gray-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    info: 'bg-info-500',
    primary: 'bg-primary-500',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full
        border shadow-soft transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className="relative inline-flex">
          <span className={`${dotColors[variant]} ${dotSizes[size]} rounded-full`} />
          {pulse && (
            <span className={`absolute inset-0 ${dotColors[variant]} ${dotSizes[size]} rounded-full animate-ping opacity-75`} />
          )}
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;
