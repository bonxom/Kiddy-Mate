import { useState } from 'react';
import { Gift, AlertCircle, TrendingDown, FileText, Check, X } from 'lucide-react';
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
    <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300"
        style={{
          background: enabled
            ? 'linear-gradient(to right, #3b82f6, #8b5cf6)'
            : 'rgb(209 213 219)'
        }}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
            enabled ? 'translate-x-6' : 'translate-x-0.5'
          }`}
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

interface CheckboxPropsWithIcon extends CheckboxProps {
  icon?: React.ReactNode;
}

const Checkbox = ({ checked, onChange, label, disabled, icon }: CheckboxPropsWithIcon) => {
  return (
    <label className={`flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${disabled ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-1 w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed"
        style={{
          accentColor: checked ? '#3b82f6' : undefined
        }}
      />
      {icon && <span className="mt-0.5 text-gray-500">{icon}</span>}
      <span className="text-sm text-gray-700 flex-1">{label}</span>
    </label>
  );
};

const NotificationSettingsTab = () => {
  const [settings, setSettings] = useState<NotificationSettings>(
    mockNotificationSettings
  );
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
    showToast('Notification settings saved', 'success');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Notification Management</h2>
      </div>

      {/* Email Notifications */}
      <Card title="Email Notifications" padding="md" className="border-l-4 border-l-blue-500">
        <div className="space-y-2">
          <ToggleSwitch
            enabled={settings.emailNotifications.enabled}
            onChange={handleEmailToggle}
            label="Enable/Disable Email Notifications"
          />

          <div className={`space-y-1 ${
            !settings.emailNotifications.enabled ? 'opacity-50' : ''
          }`} style={{ background: 'linear-gradient(to right, rgb(249 250 251), transparent)', borderRadius: '0.5rem', padding: '0.5rem' }}>
            <Checkbox
              checked={settings.emailNotifications.redemptionRequests}
              onChange={(checked) => handleEmailCheckbox('redemptionRequests', checked)}
              label="When [Child Name] has a new redemption request"
              disabled={!settings.emailNotifications.enabled}
              icon={<Gift className="w-4 h-4" />}
            />
            <Checkbox
              checked={settings.emailNotifications.missedTasks}
              onChange={(checked) => handleEmailCheckbox('missedTasks', checked)}
              label="When [Child Name] misses 3 consecutive daily tasks"
              disabled={!settings.emailNotifications.enabled}
              icon={<AlertCircle className="w-4 h-4" />}
            />
            <Checkbox
              checked={settings.emailNotifications.emotionTrends}
              onChange={(checked) => handleEmailCheckbox('emotionTrends', checked)}
              label="When emotion report shows negative trends (3 consecutive 'Sad' days)"
              disabled={!settings.emailNotifications.enabled}
              icon={<TrendingDown className="w-4 h-4" />}
            />
            <Checkbox
              checked={settings.emailNotifications.weeklyReport}
              onChange={(checked) => handleEmailCheckbox('weeklyReport', checked)}
              label="Receive weekly summary report"
              disabled={!settings.emailNotifications.enabled}
              icon={<FileText className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Push Notifications */}
      <Card title="Push Notifications" padding="md" className="border-l-4 border-l-purple-600">
        <div className="space-y-2">
          <ToggleSwitch
            enabled={settings.pushNotifications.enabled}
            onChange={handlePushToggle}
            label="Enable/Disable Push Notifications"
          />

          <div className={`space-y-1 ${
            !settings.pushNotifications.enabled ? 'opacity-50' : ''
          }`} style={{ background: 'linear-gradient(to right, rgb(250 245 255), transparent)', borderRadius: '0.5rem', padding: '0.5rem' }}>
            <Checkbox
              checked={settings.pushNotifications.redemptionRequests}
              onChange={(checked) => handlePushCheckbox('redemptionRequests', checked)}
              label="When [Child Name] has a new redemption request"
              disabled={!settings.pushNotifications.enabled}
              icon={<Gift className="w-4 h-4" />}
            />
            <Checkbox
              checked={settings.pushNotifications.missedTasks}
              onChange={(checked) => handlePushCheckbox('missedTasks', checked)}
              label="When [Child Name] misses 3 consecutive daily tasks"
              disabled={!settings.pushNotifications.enabled}
              icon={<AlertCircle className="w-4 h-4" />}
            />
            <Checkbox
              checked={settings.pushNotifications.emotionTrends}
              onChange={(checked) => handlePushCheckbox('emotionTrends', checked)}
              label="When emotion report shows negative trends (3 consecutive 'Sad' days)"
              disabled={!settings.pushNotifications.enabled}
              icon={<TrendingDown className="w-4 h-4" />}
            />
            <Checkbox
              checked={settings.pushNotifications.weeklyReport}
              onChange={(checked) => handlePushCheckbox('weeklyReport', checked)}
              label="Receive weekly summary report"
              disabled={!settings.pushNotifications.enabled}
              icon={<FileText className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>

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

export default NotificationSettingsTab;
