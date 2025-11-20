import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import type { Reward } from '../../../types/reward.types';

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
  const [formData, setFormData] = useState({
    url_thumbnail: '',
    name: '',
    cost: 0,
    remain: 0,
    description: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        url_thumbnail: initialData.url_thumbnail,
        name: initialData.name,
        cost: initialData.cost,
        remain: initialData.remain,
        description: initialData.description || '',
      });
    } else {
      setFormData({
        url_thumbnail: '',
        name: '',
        cost: 0,
        remain: 0,
        description: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          <Input
            label="Image URL"
            type="text"
            placeholder="https://example.com/image.jpg"
            value={formData.url_thumbnail}
            onChange={(e) =>
              setFormData({ ...formData, url_thumbnail: e.target.value })
            }
            required
            fullWidth
          />

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
          <Input
            label="Reward Name"
            type="text"
            placeholder="e.g., 30 minutes gaming time"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
          />

          {/* Cost and Remain - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cost (Coins)"
              type="number"
              min="0"
              placeholder="0"
              value={formData.cost || ''}
              onChange={(e) =>
                setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })
              }
              required
              fullWidth
            />
            <Input
              label="Stock Quantity"
              type="number"
              min="0"
              placeholder="0"
              value={formData.remain || ''}
              onChange={(e) =>
                setFormData({ ...formData, remain: parseInt(e.target.value) || 0 })
              }
              required
              fullWidth
            />
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
          <p className="text-gray-900 font-medium text-base">
            Are you sure you want to delete the reward "{initialData?.name}"?
          </p>
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
