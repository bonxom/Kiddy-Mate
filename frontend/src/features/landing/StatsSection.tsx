import { useState, useEffect } from 'react';

// Animated counter hook
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
};

const StatsSection = () => {
  const familiesCount = useCounter(10000);
  const tasksCount = useCounter(50000);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              {familiesCount.toLocaleString()}+
            </div>
            <div className="text-gray-700 font-semibold">Happy Families</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-2">
              95%
            </div>
            <div className="text-gray-700 font-semibold">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent mb-2">
              {tasksCount.toLocaleString()}+
            </div>
            <div className="text-gray-700 font-semibold">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent mb-2">
              4.9★
            </div>
            <div className="text-gray-700 font-semibold">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
