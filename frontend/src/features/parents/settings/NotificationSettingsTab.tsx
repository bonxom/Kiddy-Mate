import { useState, useEffect } from 'react';
import { Gift, AlertCircle, TrendingDown, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import type { NotificationSettings } from '../../../types/user.types';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '../../../api/services/userService';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
}

const ToggleSwitch = ({ enabled, onChange, label }: ToggleSwitchProps) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-all duration-200">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-soft active:scale-95"
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
    <label className={`flex items-start gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 ${disabled ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-1 w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed transition-all"
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
  const [settings, setSettings] = useState<NotificationSettings>({
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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notification settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSettings = await getNotificationSettings();
      
      // Map backend snake_case to frontend camelCase
      setSettings({
        emailNotifications: {
          enabled: fetchedSettings.email.enabled,
          redemptionRequests: fetchedSettings.email.coin_redemption,
          missedTasks: fetchedSettings.email.task_reminders,
          emotionTrends: fetchedSettings.email.emotional_trends,
          weeklyReport: fetchedSettings.email.weekly_reports,
        },
        pushNotifications: {
          enabled: fetchedSettings.push.enabled,
          redemptionRequests: fetchedSettings.push.coin_redemption,
          missedTasks: fetchedSettings.push.task_reminders,
          emotionTrends: fetchedSettings.push.emotional_trends,
          weeklyReport: fetchedSettings.push.weekly_reports,
        },
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
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

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Map frontend camelCase to backend snake_case
      const backendSettings = {
        email: {
          enabled: settings.emailNotifications.enabled,
          coin_redemption: settings.emailNotifications.redemptionRequests,
          task_reminders: settings.emailNotifications.missedTasks,
          emotional_trends: settings.emailNotifications.emotionTrends,
          weekly_reports: settings.emailNotifications.weeklyReport,
        },
        push: {
          enabled: settings.pushNotifications.enabled,
          coin_redemption: settings.pushNotifications.redemptionRequests,
          task_reminders: settings.pushNotifications.missedTasks,
          emotional_trends: settings.pushNotifications.emotionTrends,
          weekly_reports: settings.pushNotifications.weeklyReport,
        },
      };
      
      await updateNotificationSettings(backendSettings);
      
      toast.success('Notification settings saved successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow-soft">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Notification Management
        </h2>
        <p className="text-gray-600 text-sm">Configure how and when you receive notifications</p>
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
          }`} style={{ background: 'linear-gradient(to right, rgb(249 250 251), transparent)', borderRadius: '0.75rem', padding: '0.75rem' }}>
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
          }`} style={{ background: 'linear-gradient(to right, rgb(250 245 255), transparent)', borderRadius: '0.75rem', padding: '0.75rem' }}>
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
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

    </div>
  );
};

export default NotificationSettingsTab;
