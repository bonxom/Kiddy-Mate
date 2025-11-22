import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Baby, Calendar, Heart, AlertCircle, User, Lock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
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
  const [ageWarning, setAgeWarning] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    setAgeWarning(null);

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name required';
    }

    if (!formData.username || formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 3 || age > 18) {
        newErrors.dateOfBirth = 'Age must be 3-18';
      } else if (age < 6 || age > 14) {
        setAgeWarning(`Optimized for 6-14 years.`);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleTopic = (topicId: string) => {
    const currentTopics = formData.favoriteTopics || [];
    const newTopics = currentTopics.includes(topicId)
      ? currentTopics.filter(t => t !== topicId)
      : [...currentTopics, topicId];
    setFormData({ ...formData, favoriteTopics: newTopics });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 w-full min-h-[580px]"
    >
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
           Child {childNumber} / {totalChildren}
        </span>
        <h2 className="text-xl font-bold text-slate-800">Child Information</h2>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if(validateForm()) onComplete(formData); }} className="space-y-4">
        
        {/* Full Name */}
        <Input
          label="Full Name"
          value={formData.fullName}
          onChange={(e) => {
             setFormData({ ...formData, fullName: e.target.value });
             setErrors({ ...errors, fullName: '' });
          }}
          placeholder="e.g. Nguyen Van A"
          icon={<Baby className="w-4 h-4 text-slate-400" />}
          error={errors.fullName}
          fullWidth
          className="py-2 text-sm bg-slate-50 border-slate-200"
        />

        {/* Account Credentials */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Account Credentials</label>
          
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => {
              setFormData({ ...formData, username: e.target.value });
              setErrors({ ...errors, username: '' });
            }}
            placeholder="e.g. johnny_2024"
            icon={<User className="w-4 h-4 text-slate-400" />}
            error={errors.username}
            fullWidth
            className="py-2 text-sm bg-white border-slate-200"
          />
          
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              setErrors({ ...errors, password: '' });
            }}
            placeholder="Min 6 characters"
            icon={<Lock className="w-4 h-4 text-slate-400" />}
            error={errors.password}
            fullWidth
            className="py-2 text-sm bg-white border-slate-200"
          />
        </div>

        {/* Compact Grid: Nickname + DOB */}
        <div className="grid grid-cols-2 gap-4">
            <Input
                label="Nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="e.g. Bi"
                icon={<Heart className="w-4 h-4 text-slate-400" />}
                fullWidth className="py-2 text-sm bg-slate-50 border-slate-200"
            />
            <div>
                <Input
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => {
                        setFormData({ ...formData, dateOfBirth: e.target.value });
                        setErrors({ ...errors, dateOfBirth: '' });
                    }}
                    error={errors.dateOfBirth}
                    icon={<Calendar className="w-4 h-4 text-slate-400" />}
                    fullWidth className="py-2 text-sm bg-slate-50 border-slate-200"
                />
                {ageWarning && <p className="text-[10px] text-orange-500 mt-1 flex items-center gap-1"><AlertCircle size={10}/> {ageWarning}</p>}
            </div>
        </div>

        {/* Compact Gender Select */
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Gender</label>
          <div className="grid grid-cols-3 gap-2">
            {(['male', 'female', 'other'] as const).map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => setFormData({ ...formData, gender })}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  formData.gender === gender
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {gender === 'male' ? '👦 Boy' : gender === 'female' ? '👧 Girl' : '🌟 Other'}
              </button>
            ))}
          </div>
        </div>
        } 
        {/* Compact Interests (Scrollable) */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Interests (Select all)</label>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar content-start">
            {favoriteTopicOptions.map((topic) => {
              const isSelected = formData.favoriteTopics?.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-[#06325a] text-white border-[#06325a] shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {topic.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-3 gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            Back
          </Button>
          <Button
            type="submit"
            fullWidth
            icon={<ArrowRight className="w-4 h-4" />}
            className="bg-gradient-primary text-white shadow-md hover:shadow-lg"
          >
            Next Step
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChildInfoStep;