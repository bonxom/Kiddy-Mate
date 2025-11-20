import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { EmotionData } from '../../../api/services/interactionService';

interface EmotionPieChartProps {
  data: EmotionData[];
}

const EmotionPieChart = ({ data }: EmotionPieChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const COLORS = ['#34d399', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa'];

  // Show empty state if no emotion data yet
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <div className="mb-3">
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Emotion Report
          </h3>
          <p className="text-sm text-gray-600">Children's mood patterns throughout the day</p>
        </div>

        <div className="flex flex-col items-center justify-center h-[220px] text-gray-400">
          <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">No emotion data yet</p>
          <p className="text-xs text-gray-400 mt-1">Start chatting with the avatar to track emotions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Emotion Report
        </h3>
        <p className="text-sm text-gray-600">Children's mood patterns throughout the day</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name }) => name}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive={false} // tránh label chớp tắt
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={1}
                style={{
                  transition: 'transform 0.25s ease, filter 0.25s ease',
                  transform:
                    index === activeIndex ? 'scale(1.08)' : 'scale(1)',
                  filter:
                    index === activeIndex
                      ? 'drop-shadow(0 0 6px rgba(0,0,0,0.25))'
                      : 'none',
                  transformOrigin: 'center',
                }}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionPieChart;
