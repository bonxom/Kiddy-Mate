import { useState } from 'react';
import Calendar from '../../../components/ui/Calendar';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Target, Heart, Award, Users, Brain, TrendingUp } from 'lucide-react';

import type { SkillRadarData } from '../../../api/services/dashboardService';

interface DashboardSidebarProps {
  skillData: SkillRadarData[];
}

const DashboardSidebar = ({ skillData }: DashboardSidebarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getSkillIcon = (skill: string) => {
    const iconClass = "w-3.5 h-3.5";
    switch (skill) {
      case 'Independence':
        return <Target className={iconClass} />;
      case 'Emotional':
        return <Heart className={iconClass} />;
      case 'Discipline':
        return <Award className={iconClass} />;
      case 'Social':
        return <Users className={iconClass} />;
      case 'Logic':
        return <Brain className={iconClass} />;
      default:
        return null;
    }
  };

  const getSkillColor = (skill: string) => {
    switch (skill) {
      case 'Independence':
        return 'text-blue-600 bg-blue-50';
      case 'Emotional':
        return 'text-pink-600 bg-pink-50';
      case 'Discipline':
        return 'text-purple-600 bg-purple-50';
      case 'Social':
        return 'text-orange-600 bg-orange-50';
      case 'Logic':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3">
          <p className="font-bold text-gray-900 mb-2">{payload[0].payload.skill}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${payload[0].value}%`,
                  background: 'linear-gradient(to right, #60a5fa, #3b82f6)'
                }}
              />
            </div>
            <span className="text-sm font-bold text-primary-600">{payload[0].value}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Calendar Block */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <Calendar
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="w-full"
        />
      </div>

      {/* Skills Development Block */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              Skills Development
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">Overall performance metrics</p>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={skillData}>
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <PolarGrid 
                stroke="#e5e7eb" 
                strokeWidth={1.5}
              />
              <PolarAngleAxis 
                dataKey="skill" 
                tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fill: '#9ca3af', fontSize: 9 }}
                tickCount={5}
                axisLine={false}
              />
              <Radar 
                name="Skills" 
                dataKey="value" 
                stroke="#3b82f6" 
                fill="url(#radarGradient)"
                strokeWidth={2.5}
                dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                isAnimationActive={false}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Skills List with Progress */}
        <div className="mt-4 space-y-2.5 pt-4 border-t border-gray-100">
          {skillData.map((skill) => (
            <div key={skill.skill} className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${getSkillColor(skill.skill)}`}>
                {getSkillIcon(skill.skill)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">{skill.skill}</span>
                  <span className="text-xs font-bold text-gray-900">{skill.value}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${skill.value}%`,
                      background: 'linear-gradient(to right, #60a5fa, #3b82f6)'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
