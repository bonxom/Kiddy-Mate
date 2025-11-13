import { CheckCircle2, Circle } from 'lucide-react';

interface Activity {
  id: number;
  time: string;
  task: string;
  completed: boolean;
  reward: string;
}

const ActivityTimeline = () => {
  const activities: Activity[] = [
    {
      id: 1,
      time: '10:15 AM',
      task: 'Đánh răng',
      completed: true,
      reward: '+20 Sao',
    },
    {
      id: 2,
      time: '11:30 AM',
      task: 'Dọn dẹp phòng',
      completed: true,
      reward: '+30 Sao',
    },
    {
      id: 3,
      time: '02:45 PM',
      task: 'Làm bài tập toán',
      completed: false,
      reward: '+50 Sao',
    },
    {
      id: 4,
      time: '04:00 PM',
      task: 'Đọc sách 30 phút',
      completed: false,
      reward: '+25 Sao',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Today's Activities
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700 w-[15%]">
                Time
              </th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 w-[50%]">
                Task
              </th>
              <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700 w-[15%]">
                Status
              </th>
              <th className="text-right py-3 px-2 text-xs font-semibold text-gray-700 w-[20%]">
                Reward
              </th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr 
                key={activity.id} 
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-2 text-xs text-gray-600">
                  {activity.time}
                </td>
                <td className="py-3 px-3 text-sm text-gray-900 font-medium">
                  {activity.task}
                </td>
                <td className="py-3 px-2 text-center">
                  {activity.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 mx-auto" />
                  )}
                </td>
                <td className="py-3 px-2 text-right">
                  <span className={`text-xs font-semibold ${
                    activity.completed ? 'text-yellow-600' : 'text-gray-400'
                  }`}>
                    {activity.reward}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTimeline;
