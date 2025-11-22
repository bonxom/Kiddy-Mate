import { useState, useEffect } from 'react';
import { Plus, Store, Gift } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ShopManagementTab from '../../features/parents/reward-management/ShopManagementTab.tsx';
import RedemptionRequestsTab from '../../features/parents/reward-management/RedemptionRequestsTab.tsx';
import { getAllRewards, getRedemptionRequests } from '../../api/services/rewardService';

type TabType = 'shop' | 'redemption';

const RewardCenterPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('shop');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rewardsCount, setRewardsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [refreshShopTrigger, setRefreshShopTrigger] = useState(0);

  // Fetch counts on mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [rewards, requests] = await Promise.all([
          getAllRewards(),
          getRedemptionRequests()
        ]);
        setRewardsCount(rewards.length);
        setPendingRequestsCount(requests.filter(r => r.status === 'pending').length);
      } catch (error) {
        // Silently fail - counts will remain at 0
      }
    };
    fetchCounts();
  }, []);

  // Callback to update counts from child components
  const handleRewardsCountChange = (count: number) => {
    setRewardsCount(count);
  };

  const handlePendingRequestsCountChange = (count: number) => {
    setPendingRequestsCount(count);
  };

  const handleRedemptionProcessed = () => {
    // Trigger shop refresh after approve/reject
    setRefreshShopTrigger(prev => prev + 1);
  };

  const tabs = [
    {
      id: 'shop' as TabType,
      label: 'Shop Management',
      icon: Store,
      count: rewardsCount,
    },
    {
      id: 'redemption' as TabType,
      label: 'Redemption Requests',
      icon: Gift,
      count: pendingRequestsCount,
      badge: pendingRequestsCount > 0,
    },
  ];

  return (
    <div className="min-h-screen overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin bg-gray-50">
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
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex items-center justify-between border-b-2 border-gray-200 bg-gray-50/50">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-all duration-300 relative whitespace-nowrap
                      ${activeTab === tab.id
                        ? 'text-primary-700 bg-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/70 hover:shadow-soft'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-600' : ''}`} />
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
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1 rounded-t-md" 
                        style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            {activeTab === 'shop' && (
              <div className="px-4 py-2 shrink-0">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  icon={<Plus className="w-5 h-5" />}
                  size="sm"
                >
                  Add Reward
                </Button>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {activeTab === 'shop' ? (
                <ShopManagementTab 
                  isCreateModalOpen={isCreateModalOpen}
                  setIsCreateModalOpen={setIsCreateModalOpen}
                  onRewardsCountChange={handleRewardsCountChange}
                  refreshTrigger={refreshShopTrigger}
                />
              ) : (
                <RedemptionRequestsTab 
                  onPendingCountChange={handlePendingRequestsCountChange}
                  onRedemptionProcessed={handleRedemptionProcessed}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardCenterPage;
