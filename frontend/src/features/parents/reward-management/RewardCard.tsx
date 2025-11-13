import { Star, Plus, Minus } from 'lucide-react';
import type { Reward } from '../../../types/reward.types';

interface RewardCardProps {
  reward: Reward;
  onClick: () => void;
  onQuantityChange: (rewardId: string, delta: number) => void;
}

const RewardCard = ({ reward, onClick, onQuantityChange }: RewardCardProps) => {
  const handleQuantityClick = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation(); // Prevent card click event
    onQuantityChange(reward.id, delta);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={reward.url_thumbnail}
          alt={reward.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-12">
          {reward.name}
        </h3>

        {/* Cost */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-sm text-gray-600">Giá:</span>
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="font-semibold text-gray-900">{reward.cost}</span>
        </div>

        {/* Remain with Quick Edit */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Còn lại:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleQuantityClick(e, -1)}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={reward.remain === 0}
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <span className="font-semibold text-gray-900 min-w-8 text-center">
              {reward.remain}
            </span>
            <button
              onClick={(e) => handleQuantityClick(e, 1)}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardCard;
