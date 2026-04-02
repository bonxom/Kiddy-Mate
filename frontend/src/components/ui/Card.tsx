import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { translateUiString } from '../../i18n/runtime';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'glass' | 'outlined';
  badge?: ReactNode;
}

const Card = ({
  children,
  className = '',
  title,
  subtitle,
  hover = false,
  padding = 'md',
  variant = 'default',
  badge,
}: CardProps) => {
  useTranslation();
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantStyles = {
    default: 'bg-white border border-gray-100',
    gradient: 'bg-gradient-card border border-gray-100',
    glass: 'glass border-white/30',
    outlined: 'bg-white border-2 border-gray-200',
  };

  const hoverStyle = hover 
    ? 'hover:shadow-strong hover:scale-[1.02] hover:-translate-y-1 cursor-pointer card-shine' 
    : '';
  const translatedTitle = translateUiString(title);
  const translatedSubtitle = translateUiString(subtitle);

  return (
    <div 
      className={`
        rounded-2xl shadow-soft transition-all duration-300
        ${variantStyles[variant]}
        ${paddingStyles[padding]} 
        ${hoverStyle} 
        ${className}
      `}
    >
      {(translatedTitle || translatedSubtitle || badge) && (
        <div className="mb-5 flex items-start justify-between">
          <div className="flex-1">
            {translatedTitle && (
              <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                {translatedTitle}
              </h3>
            )}
            {translatedSubtitle && (
              <p className="text-sm text-gray-600">{translatedSubtitle}</p>
            )}
          </div>
          {badge && (
            <div className="ml-4 shrink-0">
              {badge}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
