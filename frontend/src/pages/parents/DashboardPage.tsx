import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDashboardData } from '../../api/services/dashboardService';
import { useChild } from '../../providers/ChildProvider';
import StatsCards from '../../features/parents/dashboard/StatsCards';
import CompletionLineChart from '../../features/parents/dashboard/CompletionLineChart';
import EmotionPieChart from '../../features/parents/dashboard/EmotionPieChart';
import TaskProgressRings from '../../features/parents/dashboard/TaskCategoryProgressRings';
import ActivityTimeline from '../../features/parents/dashboard/ActivityTimeline';
import DashboardSidebar from '../../features/parents/dashboard/DashboardSidebar';
import ReportDetailModal from '../../features/parents/dashboard/ReportDetailModal';
import ChildSelector from '../../components/common/ChildSelector';
import { Loading } from '../../components/ui';
import { TaskEvents } from '../../utils/events';
import type { Report } from '../../api/services/reportService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboardingProcessing = searchParams.get('onboarding') === 'processing';
  const { selectedChildId, children, loading: childLoading, refreshChildren } = useChild();
  const queryClient = useQueryClient();
  const [onboardingTimeout, setOnboardingTimeout] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const maxPollingAttempts = 30; // 30 attempts = ~30 seconds (1 second per attempt)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Poll children list when onboarding is processing
  useEffect(() => {
    if (!isOnboardingProcessing || childLoading) return;

    const pollInterval = setInterval(async () => {
      setPollingAttempts(prev => {
        const newAttempts = prev + 1;
        
        // Timeout after max attempts
        if (newAttempts >= maxPollingAttempts) {
          setOnboardingTimeout(true);
          clearInterval(pollInterval);
          return newAttempts;
        }

        // Refresh children list
        refreshChildren().catch(console.error);
        
        return newAttempts;
      });
    }, 1000); // Poll every 1 second

    return () => clearInterval(pollInterval);
  }, [isOnboardingProcessing, childLoading, refreshChildren]);

  // Clear onboarding processing flag when children are loaded
  useEffect(() => {
    if (isOnboardingProcessing && children.length > 0) {
      // Remove query parameter
      navigate('/parent/dashboard', { replace: true });
      setOnboardingTimeout(false);
      setPollingAttempts(0);
    }
  }, [isOnboardingProcessing, children.length, navigate]);

  // Redirect to onboarding if no children (and not processing)
  useEffect(() => {
    if (!childLoading && children.length === 0 && !isOnboardingProcessing) {
      navigate('/onboarding');
    }
  }, [childLoading, children.length, isOnboardingProcessing, navigate]);

  // Fetch dashboard data with React Query
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', selectedChildId],
    queryFn: () => getDashboardData(selectedChildId!),
    enabled: !!selectedChildId && !childLoading,
    staleTime: 30000, // Cache for 30 seconds
    retry: 2,
  });

  // Prefetch dashboard data for other children in the background
  // This runs after the main dashboard loads to optimize switching between children
  useEffect(() => {
    // Only prefetch if:
    // 1. Current child's data has loaded successfully (to prioritize current child)
    // 2. There are other children to prefetch
    // 3. Children list is available and not loading
    if (!dashboardData || !selectedChildId || children.length <= 1 || childLoading) {
      return;
    }

    // Get other children (excluding currently selected one)
    const otherChildren = children.filter(child => child.id !== selectedChildId);

    // Prefetch dashboard data for each other child
    // This runs in the background and doesn't block the UI
    // Use a small delay to avoid overwhelming the server
    const prefetchDelay = 500; // 500ms delay after main dashboard loads
    const timeoutId = setTimeout(() => {
      otherChildren.forEach((child, index) => {
        // Stagger prefetch requests slightly to avoid overwhelming the server
        setTimeout(() => {
          queryClient.prefetchQuery({
            queryKey: ['dashboard', child.id],
            queryFn: () => getDashboardData(child.id),
            staleTime: 30000, // Same cache time as main query
          }).catch(error => {
            // Silently fail prefetch - it's just for optimization
            console.debug(`Failed to prefetch dashboard for child ${child.id}:`, error);
          });
        }, index * 200); // 200ms between each prefetch
      });
    }, prefetchDelay);

    return () => clearTimeout(timeoutId);
  }, [dashboardData, selectedChildId, children, childLoading, queryClient]);

  // Listen for task events to refresh dashboard
  useEffect(() => {
    const handleTaskAssigned = () => {
      if (selectedChildId) {
        refetch();
      }
    };

    const cleanup = TaskEvents.listen(TaskEvents.TASK_ASSIGNED, handleTaskAssigned);
    const cleanupUnassigned = TaskEvents.listen(TaskEvents.TASK_UNASSIGNED, handleTaskAssigned);
    const cleanupDeleted = TaskEvents.listen(TaskEvents.TASK_DELETED, handleTaskAssigned);

    return () => {
      cleanup();
      cleanupUnassigned();
      cleanupDeleted();
    };
  }, [selectedChildId, refetch]);

  // Refetch when page becomes visible (user returns from another tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && selectedChildId) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [selectedChildId, refetch]);

  // Onboarding processing state
  if (isOnboardingProcessing) {
    if (onboardingTimeout) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⏱️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Onboarding is taking longer than expected
            </h2>
            <p className="text-gray-600 mb-6">
              Your onboarding request is still being processed. This may take a few more moments.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  refreshChildren();
                  setOnboardingTimeout(false);
                  setPollingAttempts(0);
                }}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Check Again
              </button>
              <button
                onClick={() => navigate('/onboarding')}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Back to Onboarding
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loading text="Setting up your account..." size="lg" />
          <p className="mt-4 text-gray-600">
            We're analyzing your child's assessment and creating their profile.
            <br />
            This may take a few moments...
          </p>
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (childLoading || (isLoading && !dashboardData)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading text="Loading dashboard..." />
      </div>
    );
  }

  // No children state
  if (children.length === 0) {
    return null; // Will redirect via useEffect
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load dashboard data. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data yet
  if (!dashboardData) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-scroll scrollbar-hide p-4 md:p-6 lg:p-8 scrollbar-none">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Child Selector */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">Track your children's progress and celebrate their achievements</p>
            </div>
            
            <div className="flex items-center gap-3">
              <ChildSelector />
              <span className="text-lg font-normal text-gray-500 whitespace-nowrap">
                Welcome back! 👋
              </span>
            </div>
          </div>
        
          {/* Stats Cards */}
          <div className="animate-slide-up">
            <StatsCards data={dashboardData.stats} />
          </div>

          {/* Charts Block */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Line Chart */}
            <div className="lg:col-span-2">
              <CompletionLineChart data={dashboardData.completionTrend} />
            </div>

            {/* Pie Chart and Progress Rings */}
            <div className="space-y-6">
              <EmotionPieChart data={dashboardData.emotions} />
              <TaskProgressRings data={dashboardData.categoryProgress} />
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <ActivityTimeline data={dashboardData.activityTimeline} onRefresh={refetch} />
          </div>
        </div>
      </div>

      {/* Right Sidebar - Hidden on mobile */}
      <aside className="hidden xl:block w-96 h-screen sticky top-0 bg-white/80 backdrop-blur-lg border-l border-gray-200 p-6 overflow-y-scroll scrollbar-thin shadow-soft">
        <DashboardSidebar 
          skillData={dashboardData.skillRadar}
          onViewReport={(report) => {
            setSelectedReport(report);
            setIsReportModalOpen(true);
          }}
        />
      </aside>

      {/* Report Detail Modal - Rendered at page level for center positioning */}
      <ReportDetailModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
      />
    </div>
  );
};

export default DashboardPage;
