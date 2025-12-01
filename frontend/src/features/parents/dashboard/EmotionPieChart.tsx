import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { EmotionData } from '../../../api/services/interactionService';
import { EMOTION_COLORS } from '../../../constants/categoryConfig';

interface EmotionPieChartProps {
  data: EmotionData[];
}

const EmotionPieChart = ({ data }: EmotionPieChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Check for empty array OR all values are 0 (newly registered children)
  const hasData = data && data.length > 0 && data.some(item => item.value > 0);
  
  // Calculate total for percentage calculation
  const totalEmotions = hasData 
    ? data.reduce((sum, item) => sum + item.value, 0)
    : 0;
  
  // Show "no data" state if no real data
  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="mb-3">
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Emotion Report
          </h3>
          <p className="text-sm text-gray-600">Children's mood patterns throughout the day</p>
        </div>
        
        <div className="flex flex-col items-center justify-center h-[220px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">😊</span>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Chưa có dữ liệu
            </p>
            <p className="text-xs text-gray-500">
              Bắt đầu trò chuyện với avatar để theo dõi cảm xúc
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Custom label renderer to position labels outside the pie
  const renderCustomLabel = (entry: any) => {
    const { cx, cy, midAngle, outerRadius, name, percent } = entry;
    const RADIAN = Math.PI / 180;
    
    // Calculate position for label outside the pie
    const labelRadius = outerRadius + 25; // Position label 25px outside the pie
    const labelX = cx + labelRadius * Math.cos(-midAngle * RADIAN);
    const labelY = cy + labelRadius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text
        x={labelX}
        y={labelY}
        fill="#374151"
        textAnchor={labelX > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
        className="pointer-events-none"
      >
        {`${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-visible">
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Emotion Report
        </h3>
        <p className="text-sm text-gray-600">Children's mood patterns throughout the day</p>
      </div>

      <div className="relative" style={{ height: '220px', overflow: 'visible' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <Pie
              data={data as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={65}
              fill="#8884d8"
              dataKey="value"
              isAnimationActive={false}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((_entry, index) => (
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
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const percentage = totalEmotions > 0 
                    ? ((item.value / totalEmotions) * 100).toFixed(1) 
                    : '0';
                  return (
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                      <p className="font-bold text-gray-900 mb-1">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Số lần: <span className="font-semibold text-primary-600">{item.value}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {percentage}% tổng số
                      </p>
                    </div>
                  );
                }
                return null;
              }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmotionPieChart;
