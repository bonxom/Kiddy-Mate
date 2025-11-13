import { useState } from 'react';
import AccountSettingsTab from '../../features/parents/settings/AccountSettingsTab';
import ChildProfilesTab from '../../features/parents/settings/ChildProfilesTab';
import NotificationSettingsTab from '../../features/parents/settings/NotificationSettingsTab';

type TabType = 'account' | 'children' | 'notifications';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('account');

  return (
    <div className="h-screen overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('account')}
              className={`
                px-6 py-4 text-sm font-medium transition-colors relative
                ${activeTab === 'account'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Cài đặt Tài khoản
            </button>
            <button
              onClick={() => setActiveTab('children')}
              className={`
                px-6 py-4 text-sm font-medium transition-colors relative
                ${activeTab === 'children'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Quản lý Hồ sơ Bé
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`
                px-6 py-4 text-sm font-medium transition-colors relative
                ${activeTab === 'notifications'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Cài đặt Thông báo
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'account' && <AccountSettingsTab />}
            {activeTab === 'children' && <ChildProfilesTab />}
            {activeTab === 'notifications' && <NotificationSettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
