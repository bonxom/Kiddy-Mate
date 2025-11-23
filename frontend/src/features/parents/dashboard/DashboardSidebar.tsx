import { useState } from 'react';
import Calendar from '../../../components/ui/Calendar';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, FileText, CheckCircle2, Heart } from 'lucide-react';
import type { SkillRadarData } from '../../../api/services/dashboardService';
import { SKILL_COLORS, SKILL_ICONS } from '../../../constants/categoryConfig';
import { useChild } from '../../../providers/ChildProvider';
import { generateReport } from '../../../api/services/reportService';
import { analyzeEmotionReportAndGenerateTasks } from '../../../api/services/dashboardService';
import Button from '../../../components/ui/Button';
import { useQueryClient } from '@tanstack/react-query';
import ReportsList from './ReportsList';
import toast from 'react-hot-toast';

interface DashboardSidebarProps {
  skillData: SkillRadarData[];
  onViewReport?: (report: any) => void;
}

const DashboardSidebar = ({ skillData, onViewReport }: DashboardSidebarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { selectedChildId } = useChild();
  const queryClient = useQueryClient();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingEmotionReport, setIsGeneratingEmotionReport] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (!selectedChildId) return;
    
    setIsGeneratingReport(true);
    setSuccessMessage(null);
    try {
      await generateReport(selectedChildId);
      // Refresh dashboard data and reports
      queryClient.invalidateQueries({ queryKey: ['dashboard', selectedChildId] });
      queryClient.invalidateQueries({ queryKey: ['reports', selectedChildId] });
      setSuccessMessage('Report generated successfully! Check the Reports section below.');
      setTimeout(() => setSuccessMessage(null), 5000);
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Failed to generate report:', error);
      setSuccessMessage('Failed to generate report. Please try again.');
      setTimeout(() => setSuccessMessage(null), 5000);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateEmotionReport = async () => {
    if (!selectedChildId) return;
    
    setIsGeneratingEmotionReport(true);
    setSuccessMessage(null);
    try {
      const tasks = await analyzeEmotionReportAndGenerateTasks(selectedChildId);
      // Refresh dashboard data and tasks
      queryClient.invalidateQueries({ queryKey: ['dashboard', selectedChildId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedChildId] });
      setSuccessMessage(`Emotion report analyzed! Generated ${tasks.length} personalized tasks.`);
      setTimeout(() => setSuccessMessage(null), 5000);
      toast.success(`Generated ${tasks.length} personalized tasks based on emotion analysis!`);
    } catch (error: any) {
      console.error('Failed to generate emotion report:', error);
      const errorMsg = error?.response?.data?.detail || 'Failed to generate emotion report. Please try again.';
      setSuccessMessage(errorMsg);
      setTimeout(() => setSuccessMessage(null), 5000);
      toast.error(errorMsg);
    } finally {
      setIsGeneratingEmotionReport(false);
    }
  };


  const renderSkillIcon = (skill: string) => {
    const Icon = (SKILL_ICONS as Record<string, any>)[skill] ?? SKILL_ICONS.Logic;
    if (!Icon) return null;
    return <Icon className="w-3.5 h-3.5" />;
  };

  const getSkillColor = (skill: string) => {
    const config = SKILL_COLORS[skill] || { text: 'text-gray-600', bg: 'bg-gray-50' };
    return `${config.text} ${config.bg}`;
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
      {/* Action Buttons Block */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-500" />
          AI Actions
        </h3>
        <div className="space-y-2">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            loading={isGeneratingReport}
            icon={<FileText className="w-4 h-4" />}
            onClick={handleGenerateReport}
            disabled={!selectedChildId || isGeneratingReport || isGeneratingEmotionReport}
          >
            Generate Report
          </Button>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            loading={isGeneratingEmotionReport}
            icon={<Heart className="w-4 h-4" />}
            onClick={handleGenerateEmotionReport}
            disabled={!selectedChildId || isGeneratingReport || isGeneratingEmotionReport}
          >
            Generate Emotion Report
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          <strong>Generate Report:</strong> Comprehensive analysis of progress, emotions, and development insights.
          <br />
          <strong>Generate Emotion Report:</strong> Analyze emotions and generate personalized tasks based on emotional patterns.
        </p>
        {successMessage && (
          <div className={`mt-3 p-2 rounded-lg text-xs flex items-center gap-2 ${
            successMessage.includes('Failed') 
              ? 'bg-red-50 text-red-700' 
              : 'bg-green-50 text-green-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Reports List */}
      <ReportsList onViewReport={onViewReport} />

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
                {renderSkillIcon(skill.skill)}
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
