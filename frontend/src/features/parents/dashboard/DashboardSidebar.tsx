import { useState } from 'react';
import Calendar from '../../../components/ui/Calendar';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const DashboardSidebar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Dữ liệu cho Radar Chart
  const skillData = [
    { skill: 'Independence', value: 85 },
    { skill: 'Emotional', value: 70 },
    { skill: 'Discipline', value: 90 },
    { skill: 'Social', value: 65 },
    { skill: 'Logic', value: 75 },
  ];

  return (
    <div className="space-y-5">
      {/* Calendar Block */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Select Time Period</h3>
        <div className="scale-90 origin-top -mt-2">
          <Calendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Skills Development Block */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Skills Development
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={skillData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="skill" 
              style={{ fontSize: '10px' }}
              tick={{ fill: '#6b7280' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              style={{ fontSize: '9px' }}
              tick={{ fill: '#6b7280' }}
            />
            <Radar 
              name="Skills" 
              dataKey="value" 
              stroke="#3498db" 
              fill="#3498db" 
              fillOpacity={0.5}
              strokeWidth={2}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={30}
              wrapperStyle={{ fontSize: '11px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardSidebar;
