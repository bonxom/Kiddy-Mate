import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { CompletionTrendDataPoint } from '../../../api/services/dashboardService';

interface CompletionLineChartProps {
  data: CompletionTrendDataPoint[];
}

const CompletionLineChart = ({ data }: CompletionLineChartProps) => {

  // Calculate stats
  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
  const totalTasks = data.reduce((sum, d) => sum + d.total, 0);
  // Handle division by zero - if no tasks, rate is 0
  const averageRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const currentDay = 'Sun'; // In real app, get from current date
  
  // Check if we have any data (at least one day with tasks)
  const hasData = data.some(d => d.total > 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isCurrentDay = label === currentDay;
      const payloadData = payload[0].payload;
      const rate = payloadData.total > 0 ? payloadData.rate : 0;
      return (
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4">
          <p className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            {label}
            {isCurrentDay && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold">
                Today
              </span>
            )}
          </p>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-green-600">
              ✓ Completed: <span className="text-gray-900">{payloadData.completed}</span>
            </p>
            <p className="text-sm font-semibold text-gray-500">
              □ Total: <span className="text-gray-900">{payloadData.total}</span>
            </p>
            <div className="pt-2 mt-2 border-t border-gray-200">
              <p className="text-sm font-bold text-primary-600">
                Success Rate: {rate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Show "No data" message if no tasks at all
  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Weekly Completion Trend
          </h3>
          <p className="text-sm text-gray-600 mb-4">Task completion performance</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-500 text-sm font-medium">
              Chưa có dữ liệu
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Chưa có task nào được giao trong tuần này
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full cursor-pointer">  
      {/* Header with Mini Stats */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Weekly Completion Trend
            </h3>
            <p className="text-sm text-gray-600">Task completion performance</p>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-gray-700">
            {totalCompleted}/{totalTasks} tasks completed
          </span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-green-400 via-green-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${averageRate}%` }}
            />
          </div>
          <span className="font-bold text-green-600">{averageRate}%</span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="97%" height="81%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <defs>
            {/* Gradient for completed tasks area */}
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2}/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
            </linearGradient>
            {/* Gradient for total tasks area */}
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.15}/>
              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.02}/>
            </linearGradient>
            {/* Gradient for stroke */}
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981"/>
              <stop offset="50%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#8b5cf6"/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          
          {/* Average line reference - only show if we have data */}
          {averageRate > 0 && (
            <ReferenceLine 
              y={averageRate / 100 * 13} 
              stroke="#94a3b8" 
              strokeDasharray="5 5" 
              strokeWidth={1.5}
              label={{ 
                value: 'Avg', 
                position: 'right',
                fill: '#64748b',
                fontSize: 11,
                fontWeight: 600
              }}
            />
          )}
          
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8"
            style={{ fontSize: '12px', fontWeight: '600' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          
          <YAxis 
            stroke="#94a3b8"
            style={{ fontSize: '12px', fontWeight: '500' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }} />
          
          {/* Total tasks area (background) */}
          <Area
            type="monotone"
            dataKey="total"
            stroke="#94a3b8"
            strokeWidth={2}
            fill="url(#colorTotal)"
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
          />
          
          {/* Completed tasks area (foreground) */}
          <Area
            type="monotone"
            dataKey="completed"
            stroke="url(#strokeGradient)"
            strokeWidth={3}
            fill="url(#colorCompleted)"
            dot={(props: any) => {
              const isToday = props.payload.name === currentDay;
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={isToday ? 7 : 5}
                  fill={isToday ? '#10b981' : '#3b82f6'}
                  stroke="#fff"
                  strokeWidth={isToday ? 3 : 2}
                  className={isToday ? 'animate-pulse' : ''}
                />
              );
            }}
            activeDot={{ 
              r: 8, 
              strokeWidth: 3,
              stroke: '#fff',
              fill: '#10b981'
            }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompletionLineChart;
