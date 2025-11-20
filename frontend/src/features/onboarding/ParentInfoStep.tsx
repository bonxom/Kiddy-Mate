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
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-blue-100 via-purple-100 to-pink-200 relative overflow-hidden">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 shadow-glow-accent mb-4 animate-bounce-soft">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent mb-3">
            Welcome to Kiddy-Mate! 🎉
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Let's get to know you better
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-medium">
                1
              </div>
              <span className="text-sm font-bold text-gray-900">Parent Info</span>
            </div>
            <div className="w-16 h-1.5 bg-linear-to-r from-gray-200 to-gray-300 rounded-full" />
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm font-medium text-gray-400">Child Info</span>
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
                        className={`h-14 rounded-xl border-2 font-bold text-lg transition-all duration-300 shadow-soft hover:shadow-medium active:scale-95 ${
                          formData.numberOfChildren === num
                            ? 'border-purple-500 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 text-purple-700 shadow-strong scale-105'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-600 hover:scale-105'
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
            <div className="p-5 bg-linear-to-r from-blue-100 via-purple-100 to-pink-100 rounded-2xl border-2 border-blue-200 shadow-soft">
              <p className="text-sm text-gray-800 leading-relaxed">
                <span className="font-bold text-purple-700">✨ What's next?</span> After this, we'll collect basic information 
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
                className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-soft hover:shadow-strong active:scale-95 transition-all duration-300"
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
