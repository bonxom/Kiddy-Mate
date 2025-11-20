import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '../../api/services/dashboardService';
import { useChild } from '../../providers/ChildProvider';
import StatsCards from '../../features/parents/dashboard/StatsCards';
import CompletionLineChart from '../../features/parents/dashboard/CompletionLineChart';
import EmotionPieChart from '../../features/parents/dashboard/EmotionPieChart';
import TaskProgressRings from '../../features/parents/dashboard/TaskCategoryProgressRings';
import ActivityTimeline from '../../features/parents/dashboard/ActivityTimeline';
import DashboardSidebar from '../../features/parents/dashboard/DashboardSidebar';
import { Loading } from '../../components/ui';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { selectedChildId, children, loading: childLoading } = useChild();

  // Redirect to onboarding if no children
  useEffect(() => {
    if (!childLoading && children.length === 0) {
      navigate('/onboarding');
    }
  }, [childLoading, children.length, navigate]);

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
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard
              <span className="ml-3 text-lg font-normal text-gray-500">
                Welcome back! 👋
              </span>
            </h1>
            <p className="text-gray-600">Track your children's progress and celebrate their achievements</p>
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
            <ActivityTimeline data={dashboardData.activityTimeline} />
          </div>
        </div>
      </div>

      {/* Right Sidebar - Hidden on mobile */}
      <aside className="hidden xl:block w-96 h-screen sticky top-0 bg-white/80 backdrop-blur-lg border-l border-gray-200 p-6 overflow-y-scroll scrollbar-thin shadow-soft">
        <DashboardSidebar skillData={dashboardData.skillRadar} />
      </aside>
    </div>
  );
};

export default DashboardPage;
