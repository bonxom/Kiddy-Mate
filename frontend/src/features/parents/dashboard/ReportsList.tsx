import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports, type Report } from '../../../api/services/reportService';
import { useChild } from '../../../providers/ChildProvider';
import { FileText, Calendar, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Loading } from '../../../components/ui';
import { Badge } from '../../../components/ui';

interface ReportsListProps {
  onReportGenerated?: () => void;
  onViewReport?: (report: Report) => void;
}

const ReportsList = ({ onReportGenerated, onViewReport }: ReportsListProps) => {
  const { selectedChildId } = useChild();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastReportCount, setLastReportCount] = useState(0);
  const [hasNewReport, setHasNewReport] = useState(false);

  const {
    data: reports,
    isLoading,
  } = useQuery({
    queryKey: ['reports', selectedChildId],
    queryFn: () => getReports(selectedChildId!),
    enabled: !!selectedChildId,
    staleTime: 30000,
  });

  // Sort reports by generated_at (newest first)
  const sortedReports = reports 
    ? [...reports].sort((a, b) => {
        const dateA = new Date(a.generated_at).getTime();
        const dateB = new Date(b.generated_at).getTime();
        return dateB - dateA; // Descending order (newest first)
      })
    : [];

  // Detect new reports and show badge
  useEffect(() => {
    if (!sortedReports) return;
    
    const currentCount = sortedReports.length;
    
    // If report count increased, there's a new report
    if (currentCount > lastReportCount && lastReportCount > 0) {
      setHasNewReport(true);
      
      // Clear the "new" indicator after 10 seconds
      const timeoutId = setTimeout(() => {
        setHasNewReport(false);
      }, 10000);
      
      return () => clearTimeout(timeoutId);
    }
    
    // Update last count
    setLastReportCount(currentCount);
  }, [sortedReports, lastReportCount]);

  // Reset when child changes
  useEffect(() => {
    setLastReportCount(0);
    setHasNewReport(false);
    setIsExpanded(false);
  }, [selectedChildId]);

  // Check if scrollable and show indicator
  useEffect(() => {
    if (!isExpanded || !sortedReports) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollable = () => {
      const hasScroll = container.scrollHeight > container.clientHeight;
      const isScrolledToBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
      setShowScrollIndicator(hasScroll && !isScrolledToBottom);
    };

    // Check after a small delay to ensure DOM is updated
    const timeoutId = setTimeout(checkScrollable, 100);
    checkScrollable();
    
    container.addEventListener('scroll', checkScrollable);
    window.addEventListener('resize', checkScrollable);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', checkScrollable);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [isExpanded, sortedReports]);

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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          setHasNewReport(false); // Clear new indicator when user manually expands
        }}
        className="w-full flex items-center justify-between mb-2"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-500" />
          <h3 className="text-base font-bold text-gray-900">Reports</h3>
          {hasNewReport && (
            <Badge variant="primary" size="sm" className="animate-pulse">
              New
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {sortedReports && sortedReports.length > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {sortedReports.length}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="relative mt-3">
          {isLoading ? (
            <div className="py-4">
              <Loading size="sm" />
            </div>
          ) : !sortedReports || sortedReports.length === 0 ? (
            <div className="py-6 text-center">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No reports yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Generate a report to see insights
              </p>
            </div>
          ) : (
            <>
              <div 
                ref={scrollContainerRef}
                className="space-y-2 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none'
                }}
              >
                {sortedReports.map((report, index) => (
                  <button
                    key={report.id}
                    onClick={() => handleViewReport(report)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group ${
                      hasNewReport && index === 0
                        ? 'border-primary-400 bg-primary-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-500">
                            {formatDate(report.generated_at)}
                          </span>
                          {hasNewReport && index === 0 && (
                            <Badge variant="primary" size="sm" className="ml-1">
                              New
                            </Badge>
                          )}
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
              {/* Scroll Indicator */}
              {showScrollIndicator && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-white via-white/80 to-transparent pointer-events-none flex items-end justify-center pb-2 transition-opacity duration-300">
                  <ChevronDown className="w-4 h-4 text-gray-400 animate-bounce" />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsList;

