import { useState } from 'react';
import type { Reward } from '../../../types/reward.types';
import RewardCard from './RewardCard';
import RewardModal from './RewardModal';

// Mock data
const mockRewards: Reward[] = [
  {
    id: '1',
    url_thumbnail: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
    name: '30 phút chơi game',
    cost: 50,
    remain: 10,
    description: 'Được chơi game yêu thích 30 phút',
  },
  {
    id: '2',
    url_thumbnail: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400',
    name: 'Đi xem phim',
    cost: 100,
    remain: 3,
    description: 'Cả nhà cùng đi xem phim tại rạp',
  },
  {
    id: '3',
    url_thumbnail: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400',
    name: 'Đồ chơi mới',
    cost: 150,
    remain: 2,
    description: 'Được mua 1 món đồ chơi yêu thích',
  },
  {
    id: '4',
    url_thumbnail: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    name: 'Pizza tự chọn',
    cost: 80,
    remain: 5,
    description: 'Được chọn topping pizza theo ý thích',
  },
  {
    id: '5',
    url_thumbnail: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400',
    name: 'Đi công viên',
    cost: 60,
    remain: 8,
    description: 'Đi chơi công viên vào cuối tuần',
  },
  {
    id: '6',
    url_thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    name: 'Sách truyện mới',
    cost: 40,
    remain: 15,
    description: 'Được mua 1 cuốn sách truyện mới',
  },
];

interface ShopManagementTabProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (value: boolean) => void;
}

const ShopManagementTab = ({ isCreateModalOpen, setIsCreateModalOpen }: ShopManagementTabProps) => {
  const [rewards, setRewards] = useState<Reward[]>(mockRewards);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleCardClick = (reward: Reward) => {
    setSelectedReward(reward);
    setIsEditModalOpen(true);
  };

  const handleQuantityChange = (rewardId: string, delta: number) => {
    setRewards(
      rewards.map((r) =>
        r.id === rewardId
          ? { ...r, remain: Math.max(0, r.remain + delta) }
          : r
      )
    );
  };

  const handleSaveReward = (rewardData: Omit<Reward, 'id'>) => {
    if (selectedReward) {
      // Edit existing reward
      setRewards(
        rewards.map((r) =>
          r.id === selectedReward.id ? { ...r, ...rewardData } : r
        )
      );
      setIsEditModalOpen(false);
      setSelectedReward(null);
    } else {
      // Create new reward
      const newReward: Reward = {
        id: Date.now().toString(),
        ...rewardData,
      };
      setRewards([...rewards, newReward]);
      setIsCreateModalOpen(false);
    }
  };

  const handleDeleteReward = (rewardId: string) => {
    setRewards(rewards.filter((r) => r.id !== rewardId));
    setIsEditModalOpen(false);
    setSelectedReward(null);
  };

  return (
    <div>
      {/* Description */}
      <p className="text-gray-600 mb-6">Quản lý Cửa hàng Phần thưởng</p>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            onClick={() => handleCardClick(reward)}
            onQuantityChange={handleQuantityChange}
          />
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Chưa có phần thưởng nào</p>
          <p className="text-sm mt-2">Nhấn nút "Thêm Phần thưởng" để tạo phần thưởng mới</p>
        </div>
      )}

      {/* Create Modal */}
      <RewardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveReward}
        title="Thêm Phần thưởng Mới"
      />

      {/* Edit Modal */}
      {selectedReward && (
        <RewardModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedReward(null);
          }}
          onSave={handleSaveReward}
          onDelete={handleDeleteReward}
          initialData={selectedReward}
          title="Chỉnh sửa Phần thưởng"
        />
      )}
    </div>
  );
};

export default ShopManagementTab;
