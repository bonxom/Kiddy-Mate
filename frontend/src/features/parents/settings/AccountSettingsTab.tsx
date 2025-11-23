import { useState, useEffect } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import type { UserProfile, PasswordChangeData } from '../../../types/user.types';
import {
  getUserProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../../../api/services/userService';
import { logout } from '../../../api/services/authService';

const AccountSettingsTab = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserProfile();
      
      const userProfile: UserProfile = {
        id: data.id,
        displayName: data.full_name,
        email: data.email,
        createdAt: new Date(data.created_at).toLocaleDateString('vi-VN'),
      };
      
      setProfile(userProfile);
      setDisplayName(data.full_name);
      setPhoneNumber(data.phone_number || '');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges) {
          handleSaveProfile();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges]);

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { strength: (strength / 5) * 100, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength: (strength / 5) * 100, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: (strength / 5) * 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      setError(null);
      
      await updateProfile({
        full_name: displayName,
        phone_number: phoneNumber || undefined,
      });
      
      setProfile({ ...profile, displayName });
      setHasUnsavedChanges(false);
      showToast('Personal information saved successfully', 'success');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      await changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      
      showToast('Password updated successfully', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update password';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const [deletePassword, setDeletePassword] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('Please type "DELETE" exactly to confirm', 'error');
      return;
    }
    
    if (!deletePassword) {
      showToast('Please enter your password', 'error');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      await deleteAccount({
        confirmation: deleteConfirmText,
        password: deletePassword,
      });
      
      showToast('Account has been deleted', 'success');
      
      // Logout and redirect after 2 seconds
      setTimeout(() => {
        logout();
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete account';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
      setIsDeleteModalOpen(false);
      setDeleteConfirmText('');
      setDeletePassword('');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Failed to load profile. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow-soft">
          {error}
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="p-4 rounded-xl border-2 border-yellow-300 shadow-soft flex items-center gap-3 animate-slide-down" style={{ background: 'linear-gradient(to right, rgb(254 252 232), rgb(254 243 199))' }}>
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-yellow-800">You have unsaved changes</p>
            <p className="text-sm text-yellow-700">Press "Save Changes" or Ctrl+S to save</p>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Parent Account Information
        </h2>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Personal Information */}
        <Card title="Personal Information" padding="md">
          <div className="space-y-4">
            <Input
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="e.g., Parent of Baby Bap"
              fullWidth
            />
            <Input
              label="Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="e.g., +84 123 456 789"
              fullWidth
            />
            <Input
              label="Email"
              type="email"
              value={profile.email}
              disabled
              fullWidth
              helperText="Login email cannot be changed"
            />
            <div className="pt-2">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Column 2: Security */}
        <Card title="Security" subtitle="Change Password" padding="md">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              required
              fullWidth
            />
            <div>
              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
                fullWidth
              />
              {/* Password Strength Indicator */}
              {passwordData.newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Password Strength:</span>
                    <span className={`font-medium ${
                      passwordStrength.label === 'Weak' ? 'text-red-600' :
                      passwordStrength.label === 'Medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              required
              fullWidth
            />
            <div className="pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Block 3: Danger Zone */}
      <Card padding="md" className="border-2 border-red-200 bg-red-50/30 shadow-soft">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <h3 className="text-lg font-semibold text-red-600 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </h3>
            <p className="text-sm text-gray-600">
              This action cannot be undone. All your data and children's data will be
              permanently deleted.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Account Permanently
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
        title="Confirm Account Deletion"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl border-2 border-red-300 shadow-soft" style={{ background: 'linear-gradient(to right, rgb(254 242 242), rgb(254 226 226))' }}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold mb-1">Critical Warning</p>
                <p className="text-sm text-red-700">
                  This action will permanently delete your account and all related data.
                  You will not be able to recover it.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm:
            </label>
            <Input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              fullWidth
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your password:
            </label>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your password"
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
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || !deletePassword || saving}
            >
              {saving ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettingsTab;
