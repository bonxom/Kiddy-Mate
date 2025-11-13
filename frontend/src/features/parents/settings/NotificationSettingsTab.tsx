import { useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import type { NotificationSettings } from '../../../types/user.types';

// Mock data
const mockNotificationSettings: NotificationSettings = {
  emailNotifications: {
    enabled: true,
    redemptionRequests: true,
    missedTasks: true,
    emotionTrends: false,
    weeklyReport: true,
  },
  pushNotifications: {
    enabled: false,
    redemptionRequests: false,
    missedTasks: false,
    emotionTrends: false,
    weeklyReport: false,
  },
};

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
}

const ToggleSwitch = ({ enabled, onChange, label }: ToggleSwitchProps) => {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${enabled ? 'bg-accent' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
};

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const Checkbox = ({ checked, onChange, label, disabled }: CheckboxProps) => {
  return (
    <label className={`flex items-start gap-3 py-2 cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-1 w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent cursor-pointer disabled:cursor-not-allowed"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};

const NotificationSettingsTab = () => {
  const [settings, setSettings] = useState<NotificationSettings>(
    mockNotificationSettings
  );

  const handleEmailToggle = (enabled: boolean) => {
    setSettings({
      ...settings,
      emailNotifications: {
        ...settings.emailNotifications,
        enabled,
      },
    });
  };

  const handlePushToggle = (enabled: boolean) => {
    setSettings({
      ...settings,
      pushNotifications: {
        ...settings.pushNotifications,
        enabled,
      },
    });
  };

  const handleEmailCheckbox = (field: keyof Omit<NotificationSettings['emailNotifications'], 'enabled'>, checked: boolean) => {
    setSettings({
      ...settings,
      emailNotifications: {
        ...settings.emailNotifications,
        [field]: checked,
      },
    });
  };

  const handlePushCheckbox = (field: keyof Omit<NotificationSettings['pushNotifications'], 'enabled'>, checked: boolean) => {
    setSettings({
      ...settings,
      pushNotifications: {
        ...settings.pushNotifications,
        [field]: checked,
      },
    });
  };

  const handleSave = () => {
    // TODO: Implement API call
    console.log('Save notification settings:', settings);
    alert('Đã lưu cài đặt thông báo');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Quản lý Thông báo</h2>
      </div>

      {/* Email Notifications */}
      <Card title="Thông báo qua Email" padding="md">
        <div className="space-y-2">
          <ToggleSwitch
            enabled={settings.emailNotifications.enabled}
            onChange={handleEmailToggle}
            label="Bật/Tắt thông báo Email"
          />

          <div className={`pl-4 border-l-2 border-gray-200 space-y-1 ${
            !settings.emailNotifications.enabled ? 'opacity-50' : ''
          }`}>
            <Checkbox
              checked={settings.emailNotifications.redemptionRequests}
              onChange={(checked) => handleEmailCheckbox('redemptionRequests', checked)}
              label="Khi [Tên bé] có yêu cầu đổi thưởng mới"
              disabled={!settings.emailNotifications.enabled}
            />
            <Checkbox
              checked={settings.emailNotifications.missedTasks}
              onChange={(checked) => handleEmailCheckbox('missedTasks', checked)}
              label="Khi [Tên bé] bỏ lỡ 3 nhiệm vụ hàng ngày liên tiếp"
              disabled={!settings.emailNotifications.enabled}
            />
            <Checkbox
              checked={settings.emailNotifications.emotionTrends}
              onChange={(checked) => handleEmailCheckbox('emotionTrends', checked)}
              label="Khi báo cáo cảm xúc có xu hướng tiêu cực (3 ngày 'Buồn' liên tiếp)"
              disabled={!settings.emailNotifications.enabled}
            />
            <Checkbox
              checked={settings.emailNotifications.weeklyReport}
              onChange={(checked) => handleEmailCheckbox('weeklyReport', checked)}
              label="Nhận báo cáo tổng kết hàng tuần"
              disabled={!settings.emailNotifications.enabled}
            />
          </div>
        </div>
      </Card>

      {/* Push Notifications */}
      <Card title="Thông báo Đẩy (Push Notification)" padding="md">
        <div className="space-y-2">
          <ToggleSwitch
            enabled={settings.pushNotifications.enabled}
            onChange={handlePushToggle}
            label="Bật/Tắt thông báo Đẩy"
          />

          <div className={`pl-4 border-l-2 border-gray-200 space-y-1 ${
            !settings.pushNotifications.enabled ? 'opacity-50' : ''
          }`}>
            <Checkbox
              checked={settings.pushNotifications.redemptionRequests}
              onChange={(checked) => handlePushCheckbox('redemptionRequests', checked)}
              label="Khi [Tên bé] có yêu cầu đổi thưởng mới"
              disabled={!settings.pushNotifications.enabled}
            />
            <Checkbox
              checked={settings.pushNotifications.missedTasks}
              onChange={(checked) => handlePushCheckbox('missedTasks', checked)}
              label="Khi [Tên bé] bỏ lỡ 3 nhiệm vụ hàng ngày liên tiếp"
              disabled={!settings.pushNotifications.enabled}
            />
            <Checkbox
              checked={settings.pushNotifications.emotionTrends}
              onChange={(checked) => handlePushCheckbox('emotionTrends', checked)}
              label="Khi báo cáo cảm xúc có xu hướng tiêu cực (3 ngày 'Buồn' liên tiếp)"
              disabled={!settings.pushNotifications.enabled}
            />
            <Checkbox
              checked={settings.pushNotifications.weeklyReport}
              onChange={(checked) => handlePushCheckbox('weeklyReport', checked)}
              label="Nhận báo cáo tổng kết hàng tuần"
              disabled={!settings.pushNotifications.enabled}
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>Lưu Cài đặt</Button>
      </div>
    </div>
  );
};

export default NotificationSettingsTab;
