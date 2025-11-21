import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import type { Reward } from '../../../api/services/rewardService';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Reward, 'id'>) => void;
  onDelete?: (rewardId: string) => void;
  initialData?: Reward;
  title: string;
}

const RewardModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  title,
}: RewardModalProps) => {
  const [formData, setFormData] = useState<Omit<Reward, 'id'>>({
    url_thumbnail: '',
    name: '',
    cost: 0,
    remain: 0,
    description: '',
    type: 'item',
    is_active: true,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    url_thumbnail?: string;
    name?: string;
    cost?: string;
    remain?: string;
  }>({});

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        url_thumbnail: initialData.url_thumbnail || '',
        name: initialData.name,
        cost: initialData.cost,
        remain: initialData.remain,
        description: initialData.description || '',
        type: initialData.type,
        is_active: initialData.is_active,
      });
    } else {
      setFormData({
        url_thumbnail: '',
        name: '',
        cost: 0,
        remain: 0,
        description: '',
        type: 'item',
        is_active: true,
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: typeof errors = {};
    
    if (!formData.url_thumbnail || formData.url_thumbnail.trim() === '') {
      newErrors.url_thumbnail = 'Image URL is required';
    } else if (!formData.url_thumbnail.startsWith('http')) {
      newErrors.url_thumbnail = 'Please enter a valid URL (must start with http:// or https://)';
    }
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Reward name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Reward name must be at least 3 characters';
    }
    
    if (formData.cost < 0) {
      newErrors.cost = 'Cost must be 0 or greater';
    }
    
    if (formData.remain < 0) {
      newErrors.remain = 'Stock quantity must be 0 or greater';
    }
    
    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors and submit
    setErrors({});
    onSave(formData);
  };

  const handleDelete = () => {
    if (initialData && onDelete) {
      onDelete(initialData.id);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Thumbnail */}
          <div>
            <Input
              label="Image URL"
              type="text"
              placeholder="https://example.com/image.jpg"
              value={formData.url_thumbnail}
              onChange={(e) => {
                setFormData({ ...formData, url_thumbnail: e.target.value });
                if (errors.url_thumbnail) {
                  setErrors({ ...errors, url_thumbnail: undefined });
                }
              }}
              required
              fullWidth
            />
            {errors.url_thumbnail && (
              <p className="mt-1 text-sm text-red-600">{errors.url_thumbnail}</p>
            )}
          </div>

          {/* Preview Image */}
          {formData.url_thumbnail && (
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={formData.url_thumbnail}
                alt="Preview"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+URL';
                }}
              />
            </div>
          )}

          {/* Name */}
          <div>
            <Input
              label="Reward Name"
              type="text"
              placeholder="e.g., 30 minutes gaming time"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) {
                  setErrors({ ...errors, name: undefined });
                }
              }}
              required
              fullWidth
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reward Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'badge' | 'skin' | 'item' })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="item">🎁 Item - Physical rewards (toys, books, etc.)</option>
              <option value="badge">🏅 Badge - Achievement badges</option>
              <option value="skin">👤 Skin - Avatar customization</option>
            </select>
          </div>

          {/* Cost and Remain - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Cost (Coins)"
                type="number"
                min="0"
                placeholder="0"
                value={formData.cost || ''}
                onChange={(e) => {
                  setFormData({ ...formData, cost: parseInt(e.target.value) || 0 });
                  if (errors.cost) {
                    setErrors({ ...errors, cost: undefined });
                  }
                }}
                required
                fullWidth
              />
              {errors.cost && (
                <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
              )}
            </div>
            <div>
              <Input
                label="Stock Quantity"
                type="number"
                min="0"
                placeholder="0"
                value={formData.remain || ''}
                onChange={(e) => {
                  setFormData({ ...formData, remain: parseInt(e.target.value) || 0 });
                  if (errors.remain) {
                    setErrors({ ...errors, remain: undefined });
                  }
                }}
                required
                fullWidth
              />
              {errors.remain && (
                <p className="mt-1 text-sm text-red-600">{errors.remain}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detailed description of the reward..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {initialData && onDelete && (
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-gray-900 font-semibold text-base">
              Are you sure you want to delete the reward "{initialData?.name}"?
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RewardModal;
