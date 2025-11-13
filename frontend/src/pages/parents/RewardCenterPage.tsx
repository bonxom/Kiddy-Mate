import { useState } from 'react';
import { Plus, Store, Gift } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ShopManagementTab from '../../features/parents/reward-management/ShopManagementTab.tsx';
import RedemptionRequestsTab from '../../features/parents/reward-management/RedemptionRequestsTab.tsx';

type TabType = 'shop' | 'redemption';

const RewardCenterPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('shop');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const tabs = [
    {
      id: 'shop' as TabType,
      label: 'Cửa hàng',
      icon: Store,
      count: 6,
    },
    {
      id: 'redemption' as TabType,
      label: 'Yêu cầu Đổi thưởng',
      icon: Gift,
      count: 4,
      badge: true,
    },
  ];

  return (
    <div className="min-h-screen overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reward Center 🎁
            </h1>
            <p className="text-gray-600">
              Manage rewards and approve redemption requests from your children
            </p>
          </div>
          
          {activeTab === 'shop' && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              icon={<Plus className="w-5 h-5" />}
              className="shrink-0"
            >
              Thêm Phần thưởng
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-all relative whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'text-accent-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  <Badge 
                    variant={activeTab === tab.id ? 'primary' : 'default'}
                    size="sm"
                    dot={tab.badge && activeTab !== tab.id}
                    pulse={tab.badge && activeTab !== tab.id}
                  >
                    {tab.count}
                  </Badge>
                  
                  {/* Active indicator */}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-accent" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="animate-fade-in">
              {activeTab === 'shop' ? (
                <ShopManagementTab 
                  isCreateModalOpen={isCreateModalOpen}
                  setIsCreateModalOpen={setIsCreateModalOpen}
                />
              ) : (
                <RedemptionRequestsTab />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardCenterPage;
