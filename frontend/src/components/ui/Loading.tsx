import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const Loading = ({ size = 'md', text, fullScreen = false }: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} text-accent-500 animate-spin`} strokeWidth={2.5} />
      {text && (
        <p className={`${textSizes[size]} text-gray-600 font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton Loader Components
export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl skeleton" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 rounded-lg w-3/4 skeleton" />
        <div className="h-3 bg-gray-200 rounded-lg w-1/2 skeleton" />
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
    <div className="p-4 border-b border-gray-100">
      <div className="h-6 bg-gray-200 rounded-lg w-48 skeleton" />
    </div>
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded-lg w-full skeleton" />
            <div className="h-3 bg-gray-200 rounded-lg w-2/3 skeleton" />
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded-lg skeleton" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
    <div className="mb-4">
      <div className="h-6 bg-gray-200 rounded-lg w-48 mb-2 skeleton" />
      <div className="h-4 bg-gray-200 rounded-lg w-32 skeleton" />
    </div>
    <div className="h-80 bg-gray-100 rounded-xl skeleton" />
  </div>
);

export default Loading;
