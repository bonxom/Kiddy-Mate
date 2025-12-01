import { useState, useRef, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { FileText, ChevronDown } from 'lucide-react';
import type { Report } from '../../../api/services/reportService';

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
}

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

const ReportDetailModal = ({ isOpen, onClose, report }: ReportDetailModalProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Check if scrollable and show indicator
  useEffect(() => {
    if (!isOpen) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollable = () => {
      const hasScroll = container.scrollHeight > container.clientHeight;
      const isScrolledToBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 20;
      setShowScrollIndicator(hasScroll && !isScrolledToBottom);
    };

    // Check after a short delay to ensure content is rendered
    const timeoutId = setTimeout(checkScrollable, 100);
    container.addEventListener('scroll', checkScrollable);
    window.addEventListener('resize', checkScrollable);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', checkScrollable);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [isOpen, report]);

  if (!report) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Details"
      size="xl"
    >
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="space-y-6 max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden pr-2"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none'
          }}
        >
        {/* Header with Period Info */}
        <div className="bg-linear-to-r from-primary-50 to-accent-50 rounded-xl p-4 border border-primary-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Development Report</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Period: {formatDate(report.period_start)} - {formatDate(report.period_end)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Generated</p>
              <p className="text-sm font-semibold text-gray-700">{formatDate(report.generated_at)}</p>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
            <h4 className="font-bold text-lg text-gray-900">Executive Summary</h4>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
            {report.summary_text}
          </p>
        </div>

        {/* Insights Section */}
        {report.insights && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-accent-500 rounded-full"></div>
              <h4 className="font-bold text-lg text-gray-900">Key Insights</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task Statistics */}
              {report.insights.tasks_completed !== undefined && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">✓</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-900">Task Performance</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{report.insights.tasks_completed}</p>
                  <p className="text-xs text-blue-600 mt-1">Tasks completed in this period</p>
                </div>
              )}

              {/* Most Common Emotion */}
              {report.insights.most_common_emotion && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">😊</span>
                    </div>
                    <span className="text-sm font-semibold text-purple-900">Dominant Emotion</span>
                  </div>
                  <p className="text-xl font-bold text-purple-700 capitalize">{report.insights.most_common_emotion}</p>
                  <p className="text-xs text-purple-600 mt-1">Most frequently detected</p>
                </div>
              )}
            </div>

            {/* Emotion Trends */}
            {report.insights.emotion_trends && Object.keys(report.insights.emotion_trends).length > 0 && (
              <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <span className="text-sm font-semibold text-purple-900 block mb-3">Emotion Distribution</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(report.insights.emotion_trends).map(([emotion, count]) => (
                    <div
                      key={emotion}
                      className="bg-white px-3 py-2 rounded-lg border border-purple-200 flex items-center gap-2"
                    >
                      <span className="text-xs font-medium text-purple-700 capitalize">{emotion}</span>
                      <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full">
                        {count as number}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emotional Analysis */}
            {report.insights.emotional_analysis && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <span className="text-sm font-semibold text-green-900 block mb-2">Emotional Analysis</span>
                <p className="text-sm text-green-800 leading-relaxed">
                  {report.insights.emotional_analysis}
                </p>
              </div>
            )}

            {/* Task Performance Analysis */}
            {report.insights.task_performance && (
              <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <span className="text-sm font-semibold text-indigo-900 block mb-2">Task Performance Analysis</span>
                <p className="text-sm text-indigo-800 leading-relaxed">
                  {report.insights.task_performance}
                </p>
              </div>
            )}

            {/* Strengths */}
            {report.insights.strengths && Array.isArray(report.insights.strengths) && report.insights.strengths.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-semibold text-gray-900 block mb-3">Observed Strengths</span>
                <div className="flex flex-wrap gap-2">
                  {report.insights.strengths.map((strength: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium border border-green-200"
                    >
                      <span className="text-green-600">✓</span>
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {report.insights.areas_for_improvement && Array.isArray(report.insights.areas_for_improvement) && report.insights.areas_for_improvement.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-semibold text-gray-900 block mb-3">Areas for Improvement</span>
                <div className="flex flex-wrap gap-2">
                  {report.insights.areas_for_improvement.map((area: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-medium border border-yellow-200"
                    >
                      <span className="text-yellow-600">📈</span>
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Suggestions Section */}
        {report.suggestions && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <h4 className="font-bold text-lg text-gray-900">Recommendations</h4>
            </div>
            <div className="space-y-4">
              {/* Focus Area */}
              {report.suggestions.focus && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-indigo-600 font-bold">🎯</span>
                    <span className="text-sm font-semibold text-indigo-900">Focus Area</span>
                  </div>
                  <p className="text-sm text-indigo-800 leading-relaxed">{report.suggestions.focus}</p>
                </div>
              )}

              {/* Recommended Activities */}
              {report.suggestions.recommended_activities && Array.isArray(report.suggestions.recommended_activities) && report.suggestions.recommended_activities.length > 0 && (
                <div>
                  <span className="text-sm font-semibold text-gray-900 block mb-3">Recommended Activities</span>
                  <ul className="space-y-2">
                    {report.suggestions.recommended_activities.map((activity: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-primary-500 mt-0.5">•</span>
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Parenting Tips */}
              {report.suggestions.parenting_tips && Array.isArray(report.suggestions.parenting_tips) && report.suggestions.parenting_tips.length > 0 && (
                <div>
                  <span className="text-sm font-semibold text-gray-900 block mb-3">Parenting Tips</span>
                  <ul className="space-y-2">
                    {report.suggestions.parenting_tips.map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">💡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Emotional Support */}
              {report.suggestions.emotional_support && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-pink-600 font-bold">❤️</span>
                    <span className="text-sm font-semibold text-pink-900">Emotional Support</span>
                  </div>
                  <p className="text-sm text-pink-800 leading-relaxed">{report.suggestions.emotional_support}</p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white via-white/90 to-transparent pointer-events-none flex items-end justify-center pb-3 transition-opacity duration-300">
            <ChevronDown className="w-5 h-5 text-gray-400 animate-bounce" />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReportDetailModal;

