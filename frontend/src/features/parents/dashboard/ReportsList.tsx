import { useQuery } from '@tanstack/react-query';
import { getReports, type Report } from '../../../api/services/reportService';
import { useChild } from '../../../providers/ChildProvider';
import { FileText, Calendar, ChevronRight } from 'lucide-react';
import { Loading } from '../../../components/ui';

interface ReportsListProps {
  onReportGenerated?: () => void;
  onViewReport?: (report: Report) => void;
}

const ReportsList = ({ onReportGenerated, onViewReport }: ReportsListProps) => {
  const { selectedChildId } = useChild();

  const {
    data: reports,
    isLoading,
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
    if (onViewReport) {
      onViewReport(report);
    }
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
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
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
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ReportsList;

