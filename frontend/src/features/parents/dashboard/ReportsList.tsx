import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports, type Report } from '../../../api/services/reportService';
import { useChild } from '../../../providers/ChildProvider';
import { FileText, Calendar, ChevronRight, Eye } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { Loading } from '../../../components/ui';

interface ReportsListProps {
  onReportGenerated?: () => void;
}

const ReportsList = ({ onReportGenerated }: ReportsListProps) => {
  const { selectedChildId } = useChild();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: reports,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['reports', selectedChildId],
    queryFn: () => getReports(selectedChildId!),
    enabled: !!selectedChildId,
    staleTime: 30000,
  });

  // Refresh when report is generated
  if (onReportGenerated) {
    // This will be called from parent
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    } catch {
      return dateString;
    }
  };

  if (!selectedChildId) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-500" />
            Reports
          </h3>
          {reports && reports.length > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {reports.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-4">
            <Loading size="sm" />
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="py-6 text-center">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No reports yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Generate a report to see insights
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => handleViewReport(report)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500">
                        {formatDate(report.generated_at)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {report.summary_text?.substring(0, 60) || 'Report'}...
                    </p>
                    {report.insights?.tasks_completed !== undefined && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span>✓ {report.insights.tasks_completed} tasks completed</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report Details"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Period */}
            <div className="flex items-center gap-4 text-sm text-gray-600 pb-4 border-b">
              <div>
                <span className="font-medium">Period: </span>
                {formatDate(selectedReport.period_start)} - {formatDate(selectedReport.period_end)}
              </div>
              <div>
                <span className="font-medium">Generated: </span>
                {formatDate(selectedReport.generated_at)}
              </div>
            </div>

            {/* Summary */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedReport.summary_text}
              </p>
            </div>

            {/* Insights */}
            {selectedReport.insights && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Insights</h4>
                <div className="space-y-3">
                  {selectedReport.insights.tasks_completed !== undefined && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-blue-900">
                        Tasks Completed: {selectedReport.insights.tasks_completed}
                      </span>
                    </div>
                  )}
                  {selectedReport.insights.emotion_trends && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-purple-900 block mb-2">
                        Emotion Trends:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedReport.insights.emotion_trends).map(([emotion, count]) => (
                          <span
                            key={emotion}
                            className="text-xs bg-white px-2 py-1 rounded-full text-purple-700"
                          >
                            {emotion}: {count as number}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedReport.insights.emotional_analysis && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-green-900 block mb-1">
                        Emotional Analysis:
                      </span>
                      <p className="text-sm text-green-800">
                        {selectedReport.insights.emotional_analysis}
                      </p>
                    </div>
                  )}
                  {selectedReport.insights.strengths && Array.isArray(selectedReport.insights.strengths) && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 block mb-1">Strengths:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.insights.strengths.map((strength: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                          >
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedReport.insights.areas_for_improvement && Array.isArray(selectedReport.insights.areas_for_improvement) && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 block mb-1">Areas for Improvement:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.insights.areas_for_improvement.map((area: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {selectedReport.suggestions && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Suggestions</h4>
                <div className="space-y-2">
                  {selectedReport.suggestions.focus && (
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-indigo-900 block mb-1">Focus Area:</span>
                      <p className="text-sm text-indigo-800">{selectedReport.suggestions.focus}</p>
                    </div>
                  )}
                  {selectedReport.suggestions.recommended_activities && Array.isArray(selectedReport.suggestions.recommended_activities) && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 block mb-1">Recommended Activities:</span>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {selectedReport.suggestions.recommended_activities.map((activity: string, idx: number) => (
                          <li key={idx}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedReport.suggestions.parenting_tips && Array.isArray(selectedReport.suggestions.parenting_tips) && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 block mb-1">Parenting Tips:</span>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {selectedReport.suggestions.parenting_tips.map((tip: string, idx: number) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default ReportsList;

