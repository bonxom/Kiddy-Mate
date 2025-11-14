import { useState } from 'react';
import { User, Users, Bell } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import AccountSettingsTab from '../../features/parents/settings/AccountSettingsTab.tsx';
import ChildProfilesTab from '../../features/parents/settings/ChildProfilesTab.tsx';
import NotificationSettingsTab from '../../features/parents/settings/NotificationSettingsTab.tsx';

type TabType = 'account' | 'children' | 'notifications';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('account');

  const tabs = [
    {
      id: 'account' as TabType,
      label: 'Account Settings',
      icon: User,
    },
    {
      id: 'children' as TabType,
      label: 'Children Profiles',
      icon: Users,
      count: 2,
    },
    {
      id: 'notifications' as TabType,
      label: 'Notifications',
      icon: Bell,
    },
  ];

  return (
    <div className="min-h-screen overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Settings ⚙️
          </h1>
          <p className="text-gray-600">
            Manage your account, children profiles, and notification preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b-2 border-gray-200 bg-gray-50/50 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-all duration-200 relative whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'text-primary-700 bg-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-colors ${activeTab === tab.id ? 'text-primary-600' : ''}`} />
                  <span>{tab.label}</span>
                  {tab.count && (
                    <Badge 
                      variant={activeTab === tab.id ? 'primary' : 'default'}
                      size="sm"
                    >
                      {tab.count}
                    </Badge>
                  )}
                  
                  {/* Active indicator - gradient */}
                  {activeTab === tab.id && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-t-md" 
                      style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="animate-fade-in">
              {activeTab === 'account' && <AccountSettingsTab />}
              {activeTab === 'children' && <ChildProfilesTab />}
              {activeTab === 'notifications' && <NotificationSettingsTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
