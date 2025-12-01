import React from 'react';
import { CheckCircle2, Circle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleApiError } from '../../../utils/errorHandler';
import { Badge } from '../../../components/ui';
import type { ActivityTimelineItem } from '../../../api/services/dashboardService';
import { getCategoryIconType, getCategoryColorClasses } from '../../../constants/categoryConfig';
import { verifyTask } from '../../../api/services/taskService';
import { useChildContext } from '../../../providers/ChildProvider';

interface Activity {
  id: string;
  time: string;
  task: string;
  category: string;
  status: string;
  completed: boolean;
  reward: string;
  childName: string;
  childAvatar: string;
}

interface GroupedActivities {
  [childName: string]: Activity[];
}

interface ActivityTimelineProps {
  data: ActivityTimelineItem[];
  onRefresh?: () => void;
}

const ActivityTimeline = ({ data, onRefresh }: ActivityTimelineProps) => {
  const { selectedChildId } = useChildContext();
  
  // Use data from API instead of mock
  const activities: Activity[] = data.map((item) => ({
    id: item.id,
    time: item.time,
    task: item.task,
    category: item.category,
    status: item.status,
    completed: item.completed,
    reward: item.reward,
    childName: item.childName,
    childAvatar: item.childAvatar,
  }));

  const handleVerifyClick = async (childTaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedChildId) {
      toast.error('Vui lòng chọn một trẻ trước');
      return;
    }
    
    if (!childTaskId) {
      toast.error('Task ID không hợp lệ. Vui lòng làm mới trang và thử lại.');
      return;
    }
    
    try {
      await verifyTask(selectedChildId, childTaskId);
      toast.success('Task đã được xác thực và phần thưởng đã được trao! 🎉');
      // Refresh dashboard if callback provided
      onRefresh?.();
    } catch (err: any) {
      console.error('Verify task error:', err);
      
      // Extract error message from various error formats
      let errorMessage = 'Không thể xác thực task';
      if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Handle specific error cases
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        toast.error('Không tìm thấy task. Vui lòng làm mới trang và thử lại.');
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden') || errorMessage.includes('do not own')) {
        toast.error('Bạn không có quyền xác thực task này.');
      } else if (errorMessage.includes('must be waiting for verification') || errorMessage.includes('status')) {
        toast.error('Task không ở trạng thái phù hợp để xác thực. Vui lòng làm mới trang.');
      } else if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        toast.error('Yêu cầu không hợp lệ. Vui lòng kiểm tra trạng thái task và thử lại.');
      } else {
        handleApiError(err, 'Không thể xác thực task');
      }
    }
  };

  // Show empty state if no activities yet
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm font-medium text-gray-500">No activities yet</p>
          <p className="text-xs text-gray-400 mt-1">Assign tasks to your child to see activity here</p>
        </div>
      </div>
    );
  }

  // Group activities by child
  const groupedActivities: GroupedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.childName]) {
      acc[activity.childName] = [];
    }
    acc[activity.childName].push(activity);
    return acc;
  }, {} as GroupedActivities);

  const renderCategoryIcon = (category: string): React.ReactElement => {
    const Icon = getCategoryIconType(category);
    return React.createElement(Icon, { className: "w-4 h-4" });
  };

  const getCategoryColor = getCategoryColorClasses;

  const getChildStats = (activities: Activity[]) => {
    const completed = activities.filter(a => a.completed).length;
    const total = activities.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Today's Activities
          </h3>
          <p className="text-sm text-gray-600">Real-time task progress for all children</p>
        </div>
        <Badge variant="info" className="text-xs">
          {Object.keys(groupedActivities).length} Children
        </Badge>
      </div>
      
      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([childName, childActivities]) => {
          const stats = getChildStats(childActivities);
          const firstActivity = childActivities[0];
          
          return (
            <div key={childName} className="space-y-3">
              {/* Child Header */}
              <div className="flex items-center justify-between pb-2 border-b-2 border-primary-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-gray-900 font-semibold text-sm shadow-md">
                    {firstActivity.childAvatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{childName}</h4>
                    <p className="text-xs text-gray-500">
                      {stats.completed} of {stats.total} completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-linear-to-r from-green-400 to-green-500 transition-all duration-300"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-green-600">
                    {stats.percentage}%
                  </span>
                </div>
              </div>

              {/* Activities Table */}
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700 w-20">
                        Status
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 rounded-tl-lg w-32">
                        Time
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                        Task
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 w-60">
                        Category
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 rounded-tr-lg w-24">
                        Reward
                      </th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700 w-20">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {childActivities.map((activity, index) => (
                      <tr 
                        key={activity.id} 
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index === childActivities.length - 1 ? 'border-b-0' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          {activity.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                                                <td className="py-2.5 px-3 text-xs text-gray-600 font-medium">
                          {activity.time}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-sm font-medium ${
                            activity.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {activity.task}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(activity.category)}`}>
                            {renderCategoryIcon(activity.category)}
                            <span>{activity.category}</span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <span className={`text-xs font-semibold ${
                            activity.completed ? 'text-yellow-600' : 'text-gray-400'
                          }`}>
                            {activity.reward}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          {activity.status === 'need_verify' && (
                            <button
                              onClick={(e) => handleVerifyClick(activity.id, e)}
                              className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Duyệt nhiệm vụ"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTimeline;
