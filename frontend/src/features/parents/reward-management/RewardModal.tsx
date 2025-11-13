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
            label="URL Hình ảnh"
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
            <div className="rounded-lg overflow-hidden border border-gray-200">
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
            label="Tên Phần thưởng"
            type="text"
            placeholder="VD: 30 phút chơi game"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
          />

          {/* Cost and Remain - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Giá (Sao)"
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
              label="Số lượng còn lại"
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
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả chi tiết về phần thưởng..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
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
                Xóa
              </Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="secondary" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Lưu</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Xác nhận xóa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa phần thưởng "{initialData?.name}" không?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RewardModal;
