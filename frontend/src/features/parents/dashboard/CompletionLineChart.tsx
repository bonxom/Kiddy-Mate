import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CompletionLineChart = () => {
  const data = [
    { name: 'Mon', completed: 5 },
    { name: 'Tue', completed: 8 },
    { name: 'Wed', completed: 6 },
    { name: 'Thu', completed: 10 },
    { name: 'Fri', completed: 7 },
    { name: 'Sat', completed: 9 },
    { name: 'Sun', completed: 11 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Task Completion Progress
      </h3>
      <ResponsiveContainer width="100%" height={504}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            style={{ fontSize: '14px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '14px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#3498db" 
            strokeWidth={3}
            dot={{ fill: '#3498db', r: 5 }}
            activeDot={{ r: 7 }}
            name="Completed"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompletionLineChart;
