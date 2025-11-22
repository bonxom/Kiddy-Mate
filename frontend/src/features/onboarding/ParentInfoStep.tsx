import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, ArrowRight, Plus, Minus, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
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
      newErrors.displayName = 'Name must be at least 2 characters';
    }
    if (formData.numberOfChildren < 1 || formData.numberOfChildren > 10) {
      newErrors.numberOfChildren = 'Valid range: 1-10';
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 w-full min-h-[580px] flex flex-col"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Let's get started! 👋</h1>
        <p className="text-sm text-slate-500">Tell us a bit about yourself to personalize your experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
        {/* Display Name */}
        <Input
          label="Your Name"
          value={formData.displayName}
          onChange={(e) => {
            setFormData({ ...formData, displayName: e.target.value });
            setErrors({ ...errors, displayName: '' });
          }}
          placeholder="e.g. Mom Sarah"
          icon={<User className="w-5 h-5 text-slate-400" />}
          error={errors.displayName}
          fullWidth
          className="py-3 text-base bg-slate-50 border-slate-200 focus:bg-white"
        />

        {/* Phone Number */}
        <Input
          label="Phone (Optional)"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder="+84 90..."
          icon={<Phone className="w-5 h-5 text-slate-400" />}
          fullWidth
          className="py-3 text-base bg-slate-50 border-slate-200 focus:bg-white"
        />

        {/* Counter for Children */}
        <div className="flex-1 flex flex-col justify-center py-6">
          <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
            Number of children?
          </label>
          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => formData.numberOfChildren > 1 && setFormData({ ...formData, numberOfChildren: formData.numberOfChildren - 1 })}
              disabled={formData.numberOfChildren <= 1}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Minus className="w-4 h-4 text-slate-600" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#06325a] flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-white">
                {formData.numberOfChildren}
                </span>
            </div>

            <button
              type="button"
              onClick={() => formData.numberOfChildren < 10 && setFormData({ ...formData, numberOfChildren: formData.numberOfChildren + 1 })}
              disabled={formData.numberOfChildren >= 10}
              className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-blue-600" />
            </button>
          </div>
          {errors.numberOfChildren && <p className="text-sm text-red-500 text-center mt-3 font-medium">{errors.numberOfChildren}</p>}
          <p className="text-xs text-slate-400 text-center mt-4">You can always add or remove children later from settings</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">What's next?</p>
            <p className="text-xs text-blue-700 leading-relaxed">We'll collect basic information about each child, followed by a quick assessment to personalize their experience.</p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            size="lg"
            icon={<ArrowRight className="w-4 h-4" />}
            className="bg-gradient-primary text-white shadow-lg hover:shadow-xl py-3 rounded-xl"
          >
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ParentInfoStep;