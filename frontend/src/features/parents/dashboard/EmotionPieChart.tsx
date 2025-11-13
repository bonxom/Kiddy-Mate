import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const EmotionPieChart = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = [
    { name: 'Happy', value: 100 },
    { name: 'Sad', value: 20 },
    { name: 'Angry', value: 10 },
  ];

  const COLORS = ['#34d399', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa'];

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
