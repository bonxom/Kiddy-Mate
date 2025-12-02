// src/features/parents/settings/EditChildForm.tsx
import { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import type { ChildProfile } from '../../../types/user.types';

interface EditChildFormProps {
  initialData: ChildProfile;
  onSave: (data: Partial<ChildProfile>) => void;
  onCancel: () => void;
}

const topicOptions = [
  { value: 'science', label: '🔬 Science', color: 'bg-blue-100 text-blue-700' },
  { value: 'math', label: '🔢 Math', color: 'bg-purple-100 text-purple-700' },
  { value: 'reading', label: '📚 Reading', color: 'bg-green-100 text-green-700' },
  { value: 'art', label: '🎨 Art', color: 'bg-pink-100 text-pink-700' },
  { value: 'music', label: '🎵 Music', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'sports', label: '⚽ Sports', color: 'bg-orange-100 text-orange-700' },
  { value: 'coding', label: '💻 Coding', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'nature', label: '🌿 Nature', color: 'bg-teal-100 text-teal-700' },
];

const EditChildForm = ({ initialData, onSave, onCancel }: EditChildFormProps) => {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName,
    nickname: initialData.nickname,
    username: '', // Empty for security - user must enter if they want to change
    password: '', // Empty for security - user must enter if they want to change
    interests: initialData.interests || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInterestToggle = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(topic)
        ? prev.interests.filter(t => t !== topic)
        : [...prev.interests, topic]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Nickname is required';
    }

    // If username is provided, validate it
    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // If password is provided, validate it
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // If one credential is provided, both must be provided
    if ((formData.username && !formData.password) || (!formData.username && formData.password)) {
      newErrors.credentials = 'If you want to change credentials, both username and password are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Only include changed fields
    const updates: Partial<ChildProfile> = {
      fullName: formData.fullName,
      nickname: formData.nickname,
      interests: formData.interests,
    };

    // Only include credentials if both are provided
    if (formData.username && formData.password) {
      updates.username = formData.username;
      updates.password = formData.password;
    }

    onSave(updates);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card title="Personal Information" padding="md" className="border-l-4 border-l-blue-500">
        <div className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g., Nguyễn Văn A"
            fullWidth
            required
            error={errors.fullName}
          />

          <Input
            label="Nickname"
            type="text"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            placeholder="e.g., Baby Bap"
            fullWidth
            required
            error={errors.nickname}
          />
        </div>
      </Card>

      {/* Account Credentials */}
      <Card 
        title="Account Credentials" 
        subtitle="Leave blank if you don't want to change"
        padding="md"
        className="border-l-4 border-l-purple-500"
      >
        <div className="space-y-4">
          {errors.credentials && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {errors.credentials}
            </div>
          )}

          <Input
            label="Username (New)"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Enter new username (optional)"
            fullWidth
            error={errors.username}
          />

          <Input
            label="Password (New)"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter new password (optional)"
            fullWidth
            error={errors.password}
          />

          <p className="text-xs text-gray-500">
            💡 To change credentials, you must provide both new username and password
          </p>
        </div>
      </Card>

      {/* Interests */}
      <Card title="Interests" subtitle="Select topics your child loves" padding="md" className="border-l-4 border-l-pink-500">
        <div className="flex flex-wrap gap-2">
          {topicOptions.map((topic) => (
            <button
              key={topic.value}
              type="button"
              onClick={() => handleInterestToggle(topic.value)}
              className={`
                px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
                ${formData.interests.includes(topic.value)
                  ? `${topic.color} shadow-md scale-105`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EditChildForm;
