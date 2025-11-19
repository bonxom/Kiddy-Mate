import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the heavy 3D component
const RobotCanvas = lazy(() => import('./RobotCanvas'));

// Lightweight loading fallback
const RobotLoading = () => (
  <div className="w-full h-full flex items-center justify-center bg-transparent">
    <div className="text-center">
      <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
      <p className="text-gray-600 font-medium">Loading 3D Experience...</p>
    </div>
  </div>
);

// Lightweight fallback for devices that might struggle
const RobotFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-transparent relative overflow-hidden">
    {/* Animated gradient blob instead of 3D model */}
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse-soft" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse-soft" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse-soft" style={{ animationDelay: '2s' }} />
    </div>
    
    {/* Robot emoji as placeholder */}
    <div className="relative z-10 text-9xl animate-bounce-soft drop-shadow-lg">
      🤖
    </div>
  </div>
);

interface RobotCanvasLazyProps {
  useFallback?: boolean; // Allow manual override for low-end devices
}

const RobotCanvasLazy = ({ useFallback = false }: RobotCanvasLazyProps) => {
  // Detect if device might struggle (simple heuristic)
  const isLowEndDevice = () => {
    if (typeof window === 'undefined') return false;
    
    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check for reduced motion preference (accessibility)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    return isMobile || prefersReducedMotion;
  };

  // Use fallback for low-end devices or manual override
  if (useFallback || isLowEndDevice()) {
    return <RobotFallback />;
  }

  return (
    <Suspense fallback={<RobotLoading />}>
      <RobotCanvas />
    </Suspense>
  );
};

export default RobotCanvasLazy;
