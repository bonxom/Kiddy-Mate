import { useState } from 'react';
import { ArrowLeft, ArrowRight, Baby, Calendar, Heart } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { favoriteTopicOptions } from '../../data/assessmentQuestions';
import type { ChildBasicInfo } from '../../types/auth.types';

interface ChildInfoStepProps {
  childNumber: number;
  totalChildren: number;
  initialData: ChildBasicInfo;
  onComplete: (data: ChildBasicInfo) => void;
  onBack: () => void;
}

const ChildInfoStep = ({ childNumber, totalChildren, initialData, onComplete, onBack }: ChildInfoStepProps) => {
  const [formData, setFormData] = useState<ChildBasicInfo>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter child\'s full name (at least 2 characters)';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Please select date of birth';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 3 || age > 18) {
        newErrors.dateOfBirth = 'Child must be between 3 and 18 years old';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onComplete(formData);
    }
  };

  const toggleTopic = (topicId: string) => {
    const currentTopics = formData.favoriteTopics || [];
    const newTopics = currentTopics.includes(topicId)
      ? currentTopics.filter(t => t !== topicId)
      : [...currentTopics, topicId];
    setFormData({ ...formData, favoriteTopics: newTopics });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="primary" className="mb-4">
            Child {childNumber} of {totalChildren}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tell us about your child 👶
          </h1>
          <p className="text-gray-600">
            This helps us create a personalized experience
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="text-sm font-medium text-gray-400">Parent Info</span>
            </div>
            <div className="w-12 h-1 bg-gradient-primary rounded-full" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm font-medium text-gray-900">Child Info</span>
            </div>
            <div className="w-12 h-1 bg-gray-200 rounded-full" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm font-medium text-gray-400">Assessment</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <Input
              label="Child's Full Name *"
              type="text"
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                setErrors({ ...errors, fullName: '' });
              }}
              placeholder="e.g., Nguyễn Minh An"
              error={errors.fullName}
              icon={<Baby className="w-5 h-5 text-gray-400" />}
              fullWidth
            />

            {/* Nickname (Optional) */}
            <Input
              label="Nickname (Optional)"
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              placeholder="e.g., Bé Bắp, Baby Emma"
              icon={<Heart className="w-5 h-5 text-gray-400" />}
              fullWidth
              helperText="What do you call them at home?"
            />

            {/* Date of Birth */}
            <Input
              label="Date of Birth *"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => {
                setFormData({ ...formData, dateOfBirth: e.target.value });
                setErrors({ ...errors, dateOfBirth: '' });
              }}
              error={errors.dateOfBirth}
              icon={<Calendar className="w-5 h-5 text-gray-400" />}
              fullWidth
            />

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Gender *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['male', 'female', 'other'] as const).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender })}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                      formData.gender === gender
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-medium'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {gender === 'male' ? '👦 Boy' : gender === 'female' ? '👧 Girl' : '🌟 Other'}
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite Topics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What does your child love? (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {favoriteTopicOptions.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggleTopic(topic.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.favoriteTopics?.includes(topic.id)
                        ? `${topic.color} ring-2 ring-offset-2 ring-current shadow-medium`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                This helps us suggest relevant tasks and rewards
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Continue to Assessment
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ChildInfoStep;
