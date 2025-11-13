import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const EmotionPieChart = () => {
  const data = [
    { name: 'Happy', value: 70 },
    { name: 'Sad', value: 20 },
    { name: 'Angry', value: 10 },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Emotion Report
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
