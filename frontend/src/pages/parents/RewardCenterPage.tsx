import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import ShopManagementTab from '../../features/parents/reward-management/ShopManagementTab';
import RedemptionRequestsTab from '../../features/parents/reward-management/RedemptionRequestsTab';

type TabType = 'shop' | 'redemption';

const RewardCenterPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('shop');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="h-screen overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reward Center</h1>
          
          {/* Add Reward Button - Only show on Shop tab */}
          {activeTab === 'shop' && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm Phần thưởng
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('shop')}
              className={`
                px-6 py-4 text-sm font-medium transition-colors relative
                ${activeTab === 'shop'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Cửa hàng
            </button>
            <button
              onClick={() => setActiveTab('redemption')}
              className={`
                px-6 py-4 text-sm font-medium transition-colors relative
                ${activeTab === 'redemption'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Yêu cầu Đổi thưởng
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
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
  );
};

export default RewardCenterPage;
