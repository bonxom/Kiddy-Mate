import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { EmotionData } from '../../../api/services/interactionService';
import { EMOTION_COLORS } from '../../../constants/categoryConfig';

interface EmotionPieChartProps {
  data: EmotionData[];
}

const EmotionPieChart = ({ data }: EmotionPieChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Hardcoded sample data for demo purposes when no real data is available
  const sampleData: EmotionData[] = [
    { name: 'Happy', value: 35 },
    { name: 'Excited', value: 25 },
    { name: 'Calm', value: 20 },
    { name: 'Neutral', value: 15 },
    { name: 'Sad', value: 5 },
  ];

  // Check for empty array OR all values are 0 (newly registered children)
  const hasData = data && data.length > 0 && data.some(item => item.value > 0);
  
  // Use sample data if no real data is available
  const displayData = hasData ? data : sampleData;

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
            data={displayData as any}
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
            {displayData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={EMOTION_COLORS[index % EMOTION_COLORS.length]}
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
      
      {!hasData && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500 italic">
            Showing sample data • Start chatting to see real emotions
          </p>
        </div>
      )}
    </div>
  );
};

export default EmotionPieChart;
