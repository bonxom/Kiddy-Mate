import StatsCards from '../../features/parents/dashboard/StatsCards';
import CompletionLineChart from '../../features/parents/dashboard/CompletionLineChart';
import EmotionPieChart from '../../features/parents/dashboard/EmotionPieChart';
import TaskCategoryBarChart from '../../features/parents/dashboard/TaskCategoryBarChart';
import ActivityTimeline from '../../features/parents/dashboard/ActivityTimeline';
import DashboardSidebar from '../../features/parents/dashboard/DashboardSidebar';

const DashboardPage = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content (78%) */}
      <div className="w-[78%] overflow-y-auto p-6 bg-gray-50 scrollbar-hide">
        <div className="max-w-7xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="mb-6">
          <StatsCards />
        </div>

        {/* Charts Block */}
        <div className="flex gap-4 mb-6">
          {/* Line Chart (68%) */}
          <div className="w-[68%]">
            <CompletionLineChart />
          </div>

          {/* Pie Chart and Bar Chart (32%) */}
          <div className="w-[32%] space-y-4">
            <EmotionPieChart />
            <TaskCategoryBarChart />
          </div>
        </div>

        {/* Bảng Hoạt động */}
        <div className="mb-6">
          <ActivityTimeline />
        </div>
        </div>
      </div>

      {/* Right Sidebar (22%) */}
      <aside className="w-[22%] h-screen sticky top-0 bg-white border-l border-gray-200 p-4 overflow-y-auto scrollbar-hide">
        <DashboardSidebar />
      </aside>
    </div>
  );
};

export default DashboardPage;
