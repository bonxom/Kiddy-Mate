import { useState, useEffect } from 'react';
import type { Reward } from '../../../api/services/rewardService';
import { 
  getAllRewards, 
  createReward, 
  updateReward, 
  deleteReward, 
  updateRewardQuantity 
} from '../../../api/services/rewardService';
import RewardCard from './RewardCard.tsx';
import RewardModal from './RewardModal.tsx';

interface ShopManagementTabProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (value: boolean) => void;
  onRewardsCountChange?: (count: number) => void;
}

const ShopManagementTab = ({ isCreateModalOpen, setIsCreateModalOpen, onRewardsCountChange }: ShopManagementTabProps) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'remain'>('name');
  const [filterStock, setFilterStock] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [filterType, setFilterType] = useState<'all' | 'badge' | 'skin' | 'item'>('all');

  // Fetch rewards on mount
  useEffect(() => {
    fetchRewards();
  }, []);

  // Notify parent when rewards count changes
  useEffect(() => {
    onRewardsCountChange?.(rewards.length);
  }, [rewards.length, onRewardsCountChange]);

  const fetchRewards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllRewards();
      setRewards(data);
    } catch (err: any) {
      console.error('Failed to fetch rewards:', err);
      setError(err.message || 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (reward: Reward) => {
    setSelectedReward(reward);
    setIsEditModalOpen(true);
  };

  const handleQuantityChange = async (rewardId: string, delta: number) => {
    try {
      const result = await updateRewardQuantity(rewardId, delta);
      setRewards(
        rewards.map((r) =>
          r.id === rewardId
            ? { ...r, remain: result.remain }
            : r
        )
      );
    } catch (err: any) {
      console.error('Failed to update quantity:', err);
      alert('Failed to update quantity: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSaveReward = async (rewardData: Omit<Reward, 'id'>) => {
    try {
      if (selectedReward) {
        // Edit existing reward
        const updated = await updateReward(selectedReward.id, {
          name: rewardData.name,
          description: rewardData.description,
          image_url: rewardData.url_thumbnail,
          cost_coins: rewardData.cost,
          stock_quantity: rewardData.remain,
          is_active: rewardData.is_active,
        });
        setRewards(
          rewards.map((r) =>
            r.id === selectedReward.id ? updated : r
          )
        );
        setIsEditModalOpen(false);
        setSelectedReward(null);
      } else {
        // Create new reward
        const newReward = await createReward({
          name: rewardData.name,
          description: rewardData.description,
          type: 'item',  // Default type
          image_url: rewardData.url_thumbnail,
          cost_coins: rewardData.cost,
          stock_quantity: rewardData.remain,
          is_active: true,
        });
        setRewards([...rewards, newReward]);
        setIsCreateModalOpen(false);
      }
    } catch (err: any) {
      console.error('Failed to save reward:', err);
      alert('Failed to save reward: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    try {
      await deleteReward(rewardId);
      setRewards(rewards.filter((r) => r.id !== rewardId));
      setIsEditModalOpen(false);
      setSelectedReward(null);
    } catch (err: any) {
      console.error('Failed to delete reward:', err);
      alert('Failed to delete reward: ' + (err.message || 'Unknown error'));
    }
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
      
      // Type filter
      const matchesType = filterType === 'all' ? true : reward.type === filterType;
      
      return matchesSearch && matchesStock && matchesType;
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

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-semibold">Error loading rewards</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchRewards}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="text-gray-500 mt-2">Loading rewards...</p>
        </div>
      )}

      {!loading && !error && (
        <>
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
          <span className="text-sm font-medium text-gray-700">Type:</span>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All', icon: '📦' },
              { value: 'item', label: 'Items', icon: '🎁' },
              { value: 'badge', label: 'Badges', icon: '🏅' },
              { value: 'skin', label: 'Skins', icon: '👤' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value as typeof filterType)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center gap-1 ${
                  filterType === filter.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-primary-300'
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
          
          <span className="text-sm font-medium text-gray-700 ml-4">Stock:</span>
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

      {/* Empty State - No Results */}
      {!loading && !error && filteredAndSortedRewards.length === 0 && rewards.length > 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No rewards match your filters</p>
          <p className="text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Empty State - No Rewards at All */}
      {!loading && !error && rewards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No rewards yet</p>
          <p className="text-sm mt-2">Click "Add Reward" button to create a new reward</p>
        </div>
      )}
      </>
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
