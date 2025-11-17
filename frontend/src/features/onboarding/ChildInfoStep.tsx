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
    <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-linear-to-br from-blue-100 via-purple-100 to-pink-200 relative overflow-hidden">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="primary" className="mb-4 text-base px-6 py-2 bg-linear-to-r from-green-600 to-emerald-600 shadow-medium">
            Child {childNumber} of {totalChildren}
          </Badge>
          <h1 className="text-4xl font-bold bg-linear-to-r from-green-700 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-3">
            Tell us about your child 👶
          </h1>
          <p className="text-lg text-gray-700 font-medium">
            This helps us create a personalized experience
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-medium">
                ✓
              </div>
              <span className="text-sm font-medium text-gray-500">Parent Info</span>
            </div>
            <div className="w-16 h-1.5 bg-linear-to-r from-green-400 to-blue-400 rounded-full shadow-soft" />
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-medium">
                2
              </div>
              <span className="text-sm font-bold text-gray-900">Child Info</span>
            </div>
            <div className="w-16 h-1.5 bg-linear-to-r from-gray-200 to-gray-300 rounded-full" />
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm font-medium text-gray-400">Assessment</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card padding="lg" className="bg-white/95 backdrop-blur-sm shadow-strong border border-white/50">
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
                    className={`py-4 px-4 rounded-xl border-2 font-bold text-base transition-all duration-300 ${
                      formData.gender === gender
                        ? 'border-blue-500 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 text-blue-700 shadow-glow-accent scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:scale-102'
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
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                      formData.favoriteTopics?.includes(topic.id)
                        ? `${topic.color} ring-2 ring-offset-2 ring-current shadow-medium scale-110`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                💡 This helps us suggest relevant tasks and rewards
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                icon={<ArrowLeft className="w-5 h-5" />}
                className="hover:scale-105 transition-transform"
              >
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                className="bg-linear-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 shadow-glow-accent hover:scale-105 transition-all duration-300"
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
