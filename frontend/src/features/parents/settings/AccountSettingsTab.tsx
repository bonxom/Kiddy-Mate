import { useState } from 'react';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import type { UserProfile, PasswordChangeData } from '../../../types/user.types';

// Mock data
const mockUserProfile: UserProfile = {
  id: '1',
  displayName: 'Phụ huynh bé Bắp',
  email: 'parent@example.com',
  createdAt: '2025-01-01',
};

const AccountSettingsTab = () => {
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSaveProfile = () => {
    setProfile({ ...profile, displayName });
    alert('Đã lưu thay đổi thông tin cá nhân');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }
    // TODO: Implement API call
    console.log('Update password:', passwordData);
    alert('Đã cập nhật mật khẩu thành công');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'DELETE') {
      // TODO: Implement API call
      console.log('Delete account');
      alert('Tài khoản đã được xóa');
      setIsDeleteModalOpen(false);
      setDeleteConfirmText('');
    } else {
      alert('Vui lòng gõ chính xác "DELETE" để xác nhận');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Thông tin Tài khoản Phụ huynh
        </h2>
      </div>

      {/* Block 1: Personal Information */}
      <Card title="Thông tin Cá nhân" padding="md">
        <div className="space-y-4">
          <Input
            label="Tên hiển thị"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="VD: Phụ huynh bé Bắp"
            fullWidth
          />
          <Input
            label="Email"
            type="email"
            value={profile.email}
            disabled
            fullWidth
            helperText="Email đăng nhập không thể thay đổi"
          />
          <div className="pt-2">
            <Button onClick={handleSaveProfile}>Lưu Thay đổi</Button>
          </div>
        </div>
      </Card>

      {/* Block 2: Security */}
      <Card title="Bảo mật" subtitle="Đổi mật khẩu" padding="md">
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, currentPassword: e.target.value })
            }
            required
            fullWidth
          />
          <Input
            label="Mật khẩu mới"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
            required
            fullWidth
          />
          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, confirmPassword: e.target.value })
            }
            required
            fullWidth
          />
          <div className="pt-2">
            <Button type="submit">Cập nhật Mật khẩu</Button>
          </div>
        </form>
      </Card>

      {/* Block 3: Danger Zone */}
      <Card padding="md" className="border-2 border-red-200">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Xóa Tài khoản
            </h3>
            <p className="text-sm text-gray-600">
              Hành động này không thể hoàn tác. Toàn bộ dữ liệu của bạn và các bé sẽ
              bị xóa vĩnh viễn.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Xóa vĩnh viễn tài khoản
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteConfirmText('');
        }}
        title="Xác nhận Xóa Tài khoản"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-red-800 font-medium mb-2">⚠️ Cảnh báo nghiêm trọng</p>
            <p className="text-sm text-red-700">
              Hành động này sẽ xóa vĩnh viễn tài khoản của bạn và toàn bộ dữ liệu liên
              quan. Bạn sẽ không thể khôi phục lại.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gõ <span className="font-bold text-red-600">DELETE</span> để xác nhận:
            </label>
            <Input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              fullWidth
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmText('');
              }}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE'}
            >
              Xóa vĩnh viễn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountSettingsTab;
