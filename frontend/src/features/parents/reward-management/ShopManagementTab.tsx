import { useState } from 'react';
import type { Reward } from '../../../types/reward.types';
import RewardCard from './RewardCard.tsx';
import RewardModal from './RewardModal.tsx';

// Mock data
const mockRewards: Reward[] = [
  {
    id: '1',
    url_thumbnail: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
    name: '30 minutes gaming time',
    cost: 50,
    remain: 10,
    description: 'Play favorite games for 30 minutes',
  },
  {
    id: '2',
    url_thumbnail: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400',
    name: 'Movie theater trip',
    cost: 100,
    remain: 3,
    description: 'Family movie outing at the cinema',
  },
  {
    id: '3',
    url_thumbnail: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400',
    name: 'New toy',
    cost: 150,
    remain: 2,
    description: 'Purchase one favorite toy',
  },
  {
    id: '4',
    url_thumbnail: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    name: 'Custom pizza',
    cost: 80,
    remain: 5,
    description: 'Choose your own pizza toppings',
  },
  {
    id: '5',
    url_thumbnail: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400',
    name: 'Park visit',
    cost: 60,
    remain: 8,
    description: 'Weekend park outing',
  },
  {
    id: '6',
    url_thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    name: 'New storybook',
    cost: 40,
    remain: 15,
    description: 'Purchase one new storybook',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'remain'>('name');
  const [filterStock, setFilterStock] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');

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

  // Filter and sort rewards
  const filteredAndSortedRewards = rewards
    .filter((reward) => {
      // Search filter
      const matchesSearch = reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           reward.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Stock filter
      const matchesStock = 
        filterStock === 'all' ? true :
        filterStock === 'out-of-stock' ? reward.remain === 0 :
        filterStock === 'low-stock' ? reward.remain > 0 && reward.remain < 5 :
        reward.remain >= 5;
      
      return matchesSearch && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'cost') return b.cost - a.cost;
      return b.remain - a.remain;
    });

  return (
    <div>
      {/* Description */}
      <p className="text-gray-600 mb-6">Manage your reward shop items</p>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search rewards by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <div className="flex gap-2">
            {['all', 'in-stock', 'low-stock', 'out-of-stock'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterStock(filter as typeof filterStock)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                  filterStock === filter
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-primary-300'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'in-stock' ? 'In Stock' : filter === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
              </button>
            ))}
          </div>
          
          <span className="text-sm font-medium text-gray-700 ml-4">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="name">Name</option>
            <option value="cost">Cost (High to Low)</option>
            <option value="remain">Stock (High to Low)</option>
          </select>

          <span className="text-sm text-gray-500 ml-auto">
            {filteredAndSortedRewards.length} reward{filteredAndSortedRewards.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Rewards Grid */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedRewards.map((reward, index) => (
          <div 
            key={reward.id}
            style={{ animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both` }}
          >
            <RewardCard
              reward={reward}
              onClick={() => handleCardClick(reward)}
              onQuantityChange={handleQuantityChange}
            />
          </div>
        ))}
      </div>

      {filteredAndSortedRewards.length === 0 && rewards.length > 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No rewards match your filters</p>
          <p className="text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      )}

      {rewards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No rewards yet</p>
          <p className="text-sm mt-2">Click "Add Reward" button to create a new reward</p>
        </div>
      )}

      {/* Create Modal */}
      <RewardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveReward}
        title="Add New Reward"
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
          title="Edit Reward"
        />
      )}
    </div>
  );
};

export default ShopManagementTab;
