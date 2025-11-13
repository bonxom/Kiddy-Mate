import { Star, Plus, Minus, Package } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import type { Reward } from '../../../types/reward.types';

interface RewardCardProps {
  reward: Reward;
  onClick: () => void;
  onQuantityChange: (rewardId: string, delta: number) => void;
}

const RewardCard = ({ reward, onClick, onQuantityChange }: RewardCardProps) => {
  const handleQuantityClick = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    onQuantityChange(reward.id, delta);
  };

  const isLowStock = reward.remain < 5 && reward.remain > 0;
  const isOutOfStock = reward.remain === 0;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer hover:shadow-strong hover:-translate-y-2 transition-all duration-300 border border-gray-100 hover:border-accent-200"
    >
      {/* Thumbnail */}
            <div className="relative h-52 bg-gray-100 overflow-hidden">
        <img
          src={reward.url_thumbnail}
          alt={reward.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <Badge variant="danger" size="sm">
              Out of Stock
            </Badge>
          ) : isLowStock ? (
            <Badge variant="warning" size="sm" dot pulse>
              Low Stock
            </Badge>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Name */}
                <h3 className="font-bold text-gray-900 text-lg line-clamp-2 min-h-14 group-hover:text-accent-600 transition-colors">
          {reward.name}
        </h3>

        {/* Cost */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-warning rounded-xl w-fit">
          <Star className="w-5 h-5 text-warning-700 fill-warning-500 animate-pulse" />
          <span className="font-bold text-gray-900 text-lg">{reward.cost}</span>
          <span className="text-sm text-gray-700">Stars</span>
        </div>

        {/* Remain with Quick Edit */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <Package className="w-4 h-4" />
            <span className="text-sm font-medium">Stock:</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
            <button
              onClick={(e) => handleQuantityClick(e, -1)}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-soft transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              disabled={reward.remain === 0}
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
            </button>
            <span className={`font-bold min-w-8 text-center text-lg ${
              isOutOfStock ? 'text-danger-600' : isLowStock ? 'text-warning-600' : 'text-gray-900'
            }`}>
              {reward.remain}
            </span>
            <button
              onClick={(e) => handleQuantityClick(e, 1)}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-soft transition-all active:scale-95"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Hover Effect Indicator */}
      <div className="h-1 bg-gradient-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
};

export default RewardCard;
