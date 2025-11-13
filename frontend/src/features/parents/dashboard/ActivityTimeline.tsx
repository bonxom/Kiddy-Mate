import { CheckCircle2, Circle, Target, Brain, Dumbbell, Palette, Users } from 'lucide-react';
import { Badge } from '../../../components/ui';

interface Activity {
  id: number;
  time: string;
  task: string;
  category: 'Independence' | 'Logic' | 'Physical' | 'Creative' | 'Social';
  completed: boolean;
  reward: string;
  childName: string;
  childAvatar: string;
}

interface GroupedActivities {
  [childName: string]: Activity[];
}

const ActivityTimeline = () => {
  const activities: Activity[] = [
    {
      id: 1,
      time: '10:15 AM',
      task: 'Brush Teeth',
      category: 'Independence',
      completed: true,
      reward: '+20 Stars',
      childName: 'Emma',
      childAvatar: 'E',
    },
    {
      id: 2,
      time: '11:30 AM',
      task: 'Clean Room',
      category: 'Independence',
      completed: true,
      reward: '+30 Stars',
      childName: 'Emma',
      childAvatar: 'E',
    },
    {
      id: 3,
      time: '02:45 PM',
      task: 'Math Homework',
      category: 'Logic',
      completed: false,
      reward: '+50 Stars',
      childName: 'Emma',
      childAvatar: 'E',
    },
    {
      id: 4,
      time: '09:30 AM',
      task: 'Morning Exercise',
      category: 'Physical',
      completed: true,
      reward: '+25 Stars',
      childName: 'Liam',
      childAvatar: 'L',
    },
    {
      id: 5,
      time: '01:00 PM',
      task: 'Drawing Class',
      category: 'Creative',
      completed: true,
      reward: '+35 Stars',
      childName: 'Liam',
      childAvatar: 'L',
    },
    {
      id: 6,
      time: '03:30 PM',
      task: 'Play with Friends',
      category: 'Social',
      completed: false,
      reward: '+20 Stars',
      childName: 'Liam',
      childAvatar: 'L',
    },
  ];

  // Group activities by child
  const groupedActivities: GroupedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.childName]) {
      acc[activity.childName] = [];
    }
    acc[activity.childName].push(activity);
    return acc;
  }, {} as GroupedActivities);

  const getCategoryIcon = (category: Activity['category']) => {
    const iconClass = "w-4 h-4";
    switch (category) {
      case 'Independence':
        return <Target className={iconClass} />;
      case 'Logic':
        return <Brain className={iconClass} />;
      case 'Physical':
        return <Dumbbell className={iconClass} />;
      case 'Creative':
        return <Palette className={iconClass} />;
      case 'Social':
        return <Users className={iconClass} />;
    }
  };

  const getCategoryColor = (category: Activity['category']) => {
    switch (category) {
      case 'Independence':
        return 'text-blue-600 bg-blue-50';
      case 'Logic':
        return 'text-purple-600 bg-purple-50';
      case 'Physical':
        return 'text-green-600 bg-green-50';
      case 'Creative':
        return 'text-pink-600 bg-pink-50';
      case 'Social':
        return 'text-orange-600 bg-orange-50';
    }
  };

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
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
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
                            {getCategoryIcon(activity.category)}
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
