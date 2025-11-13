import { useState } from 'react';
import { Plus, Edit2, Trash2, User } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import type { ChildProfile } from '../../../types/user.types';

// Mock data
const mockChildren: ChildProfile[] = [
  {
    id: '1',
    nickname: 'Bé Bắp',
    fullName: 'Nguyễn Minh An',
    dateOfBirth: '2018-01-01',
    age: 7,
    gender: 'male',
    personality: ['Hoạt bát', 'Tò mò'],
    interests: ['Vẽ', 'Lego'],
    strengths: ['Sáng tạo', 'Logic'],
    challenges: ['Tập trung'],
  },
  {
    id: '2',
    nickname: 'Bé Hà',
    fullName: 'Nguyễn Thu Hà',
    dateOfBirth: '2016-05-15',
    age: 9,
    gender: 'female',
    personality: ['Điềm đạm', 'Chu đáo'],
    interests: ['Đọc sách', 'Piano'],
    strengths: ['Học tập', 'Trách nhiệm'],
    challenges: ['Tự tin'],
  },
];

const ChildProfilesTab = () => {
  const [children, setChildren] = useState<ChildProfile[]>(mockChildren);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);

  const handleEditClick = (child: ChildProfile) => {
    setSelectedChild(child);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (child: ChildProfile) => {
    setSelectedChild(child);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedChild) {
      setChildren(children.filter((c) => c.id !== selectedChild.id));
      setIsDeleteModalOpen(false);
      setSelectedChild(null);
    }
  };

  const formatDate = (dateString: string, age: number) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} (${age} tuổi)`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Quản lý và Cập nhật Thông tin của Bé
          </h2>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm Hồ sơ Bé
        </Button>
      </div>

      {/* Children Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => (
          <div
            key={child.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Avatar */}
            <div className="bg-gradient-to-br from-accent to-primary p-8 flex items-center justify-center">
              {child.avatar ? (
                <img
                  src={child.avatar}
                  alt={child.nickname}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {child.nickname}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {formatDate(child.dateOfBirth, child.age)}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditClick(child)}
                  className="flex-1 flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Chỉnh sửa
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteClick(child)}
                  className="flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {children.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Chưa có hồ sơ bé nào</p>
          <p className="text-sm mt-2">
            Nhấn nút "Thêm Hồ sơ Bé" để tạo hồ sơ mới
          </p>
        </div>
      )}

      {/* Add Child Modal - Full Screen Questionnaire */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Hồ sơ Bé Mới"
        size="xl"
      >
        <div className="space-y-6">
          <div className="p-6 bg-blue-50 rounded-lg text-center">
            <p className="text-gray-700">
              📋 Đây là nơi hiển thị toàn bộ <strong>BỘ CÂU HỎI ĐĂNG KÝ</strong> (MỤC A, B, C, D)
              <br />
              để phụ huynh điền thông tin cho bé mới.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              (Component chi tiết sẽ được tích hợp từ phần đăng ký)
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => {
                // TODO: Implement save logic
                alert('Đã thêm hồ sơ bé mới');
                setIsAddModalOpen(false);
              }}
            >
              Lưu Hồ sơ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Child Modal - Full Screen Questionnaire */}
      {selectedChild && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedChild(null);
          }}
          title={`Chỉnh sửa Hồ sơ - ${selectedChild.nickname}`}
          size="xl"
        >
          <div className="space-y-6">
            <div className="p-6 bg-blue-50 rounded-lg text-center">
              <p className="text-gray-700">
                📋 Đây là nơi hiển thị toàn bộ <strong>BỘ CÂU HỎI ĐĂNG KÝ</strong> (MỤC A, B, C, D)
                <br />
                với dữ liệu của <strong>{selectedChild.nickname}</strong> đã được điền sẵn.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Phụ huynh có thể cập nhật lại thông tin khi bé lớn lên hoặc tính cách thay đổi.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedChild(null);
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implement update logic
                  alert('Đã cập nhật hồ sơ');
                  setIsEditModalOpen(false);
                  setSelectedChild(null);
                }}
              >
                Cập nhật Hồ sơ
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {selectedChild && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedChild(null);
          }}
          title="Xác nhận xóa"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa hồ sơ của <strong>{selectedChild.nickname}</strong> không?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedChild(null);
                }}
              >
                Hủy
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Xóa
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ChildProfilesTab;
