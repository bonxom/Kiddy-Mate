import { Star, Plus, Minus, Package } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import type { Reward } from '../../../api/services/rewardService';

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

  const getTypeBadge = () => {
    switch (reward.type) {
      case 'badge':
        return { icon: '🏅', label: 'Badge', color: 'bg-purple-100 text-purple-700' };
      case 'skin':
        return { icon: '👤', label: 'Skin', color: 'bg-blue-100 text-blue-700' };
      case 'item':
      default:
        return { icon: '🎁', label: 'Item', color: 'bg-green-100 text-green-700' };
    }
  };

  const typeBadge = getTypeBadge();

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-primary-300"
    >
      {/* Thumbnail */}
      <div className="relative h-52 bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
        <img
          src={reward.url_thumbnail || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={reward.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {/* Type Badge */}
          <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${typeBadge.color} shadow-sm flex items-center gap-1`}>
            <span>{typeBadge.icon}</span>
            <span>{typeBadge.label}</span>
          </div>
          
          {/* Stock Badge */}
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
        {/* Name and Cost Row */}
        <div className="flex items-start justify-between gap-3">
          {/* Name - Column 1 */}
          <h3 className="font-bold text-gray-900 text-lg line-clamp-2 flex-1 group-hover:text-accent-600 transition-colors">
            {reward.name}
          </h3>

          {/* Cost - Column 2 */}
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm shrink-0"
            style={{ background: 'linear-gradient(to right, rgb(254 252 232), rgb(254 243 199))' }}
          >
            <Star className="w-5 h-5 text-yellow-600 fill-yellow-500" />
            <span className="font-bold text-gray-900 text-lg">{reward.cost}</span>
            <span className="text-sm text-gray-700">Coins</span>
          </div>
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
      <div 
        className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" 
        style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}
      />
    </div>
  );
};

export default RewardCard;
