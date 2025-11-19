import StatsCards from '../../features/parents/dashboard/StatsCards';
import CompletionLineChart from '../../features/parents/dashboard/CompletionLineChart';
import EmotionPieChart from '../../features/parents/dashboard/EmotionPieChart';
import TaskProgressRings from '../../features/parents/dashboard/TaskCategoryProgressRings';
import ActivityTimeline from '../../features/parents/dashboard/ActivityTimeline';
import DashboardSidebar from '../../features/parents/dashboard/DashboardSidebar';

const DashboardPage = () => {
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
            <StatsCards />
          </div>

          {/* Charts Block */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Line Chart */}
            <div className="lg:col-span-2">
              <CompletionLineChart />
            </div>

            {/* Pie Chart and Progress Rings */}
            <div className="space-y-6">
              <EmotionPieChart />
              <TaskProgressRings />
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <ActivityTimeline />
          </div>
        </div>
      </div>

      {/* Right Sidebar - Hidden on mobile */}
      <aside className="hidden xl:block w-96 h-screen sticky top-0 bg-white/80 backdrop-blur-lg border-l border-gray-200 p-6 overflow-y-scroll scrollbar-thin shadow-soft">
        <DashboardSidebar />
      </aside>
    </div>
  );
};

export default DashboardPage;
