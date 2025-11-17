import { useState } from 'react';
import { Sparkles, User, Phone, Users, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import type { ParentInfo } from '../../types/auth.types';

interface ParentInfoStepProps {
  initialData: ParentInfo;
  onComplete: (data: ParentInfo) => void;
}

const ParentInfoStep = ({ initialData, onComplete }: ParentInfoStepProps) => {
  const [formData, setFormData] = useState<ParentInfo>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName || formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Please enter your display name (at least 2 characters)';
    }

    if (formData.numberOfChildren < 1 || formData.numberOfChildren > 10) {
      newErrors.numberOfChildren = 'Please enter a valid number of children (1-10)';
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow-accent mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Kiddy-Mate! 🎉
          </h1>
          <p className="text-gray-600 text-lg">
            Let's get to know you better
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="text-sm font-medium text-gray-900">Parent Info</span>
            </div>
            <div className="w-12 h-1 bg-gray-200 rounded-full" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm font-medium text-gray-400">Child Info</span>
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
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Tell us about yourself
              </h2>

              <div className="space-y-5">
                {/* Display Name */}
                <Input
                  label="How would you like to be called?"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => {
                    setFormData({ ...formData, displayName: e.target.value });
                    setErrors({ ...errors, displayName: '' });
                  }}
                  placeholder="e.g., Parent of Emma, Mom Sarah, Dad John"
                  error={errors.displayName}
                  icon={<User className="w-5 h-5 text-gray-400" />}
                  fullWidth
                  helperText="This is how we'll address you in the app"
                />

                {/* Phone Number (Optional) */}
                <Input
                  label="Phone Number (Optional)"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+84 123 456 789"
                  icon={<Phone className="w-5 h-5 text-gray-400" />}
                  fullWidth
                  helperText="For important notifications and account recovery"
                />

                {/* Number of Children */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    How many children do you want to add?
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, numberOfChildren: num });
                          setErrors({ ...errors, numberOfChildren: '' });
                        }}
                        className={`h-12 rounded-lg border-2 font-semibold transition-all ${
                          formData.numberOfChildren === num
                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  {errors.numberOfChildren && (
                    <p className="mt-2 text-sm text-red-600">{errors.numberOfChildren}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    You can always add more children later from settings
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">What's next?</span> After this, we'll collect basic information 
                about each of your {formData.numberOfChildren > 1 ? 'children' : 'child'}, followed by a quick 
                assessment to help us personalize their experience.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Continue to Child Info
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ParentInfoStep;
