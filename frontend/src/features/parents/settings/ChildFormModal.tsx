// src/features/parent/ChildFormModal.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ChildInfoStep from '../../onboarding/ChildInfoStep';
import AssessmentStep from '../../onboarding/AssessmentStep';
import EditChildForm from './EditChildForm';
import type { ChildBasicInfo, ChildAssessment } from '../../../types/auth.types';
import type { ChildProfile } from '../../../types/user.types';

interface ChildFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ChildProfile | null;
  onSave: (data: ChildProfile | Partial<ChildProfile>) => void;
  mode?: 'add' | 'edit'; // Explicitly specify mode
}

const ChildFormModal = ({ isOpen, onClose, initialData, onSave, mode = 'add' }: ChildFormModalProps) => {
  const [step, setStep] = useState<'info' | 'assessment'>('info');
  const [basicInfo, setBasicInfo] = useState<ChildBasicInfo>({
    fullName: '', 
    nickname: '', 
    dateOfBirth: '', 
    gender: 'male', 
    username: '',  // Add username
    password: '',  // Add password
    favoriteTopics: []
  });
  const [assessment, setAssessment] = useState<ChildAssessment>({ answers: [] });

  // Determine if we're in edit mode
  const isEditMode = mode === 'edit' || (initialData !== null && initialData !== undefined);

  useEffect(() => {
    if (initialData) {
      setBasicInfo({
        fullName: initialData.fullName,
        nickname: initialData.nickname,
        dateOfBirth: initialData.dateOfBirth,
        gender: initialData.gender,
        username: '',  // Empty for security (don't pre-fill existing username)
        password: '',  // Empty for security (never show existing password)
        favoriteTopics: initialData.interests || [],
      });
      setStep('info');
    } else {
      setBasicInfo({ 
        fullName: '', 
        nickname: '', 
        dateOfBirth: '', 
        gender: 'male', 
        username: '', 
        password: '', 
        favoriteTopics: [] 
      });
      setAssessment({ answers: [] });
      setStep('info');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Handler for edit form
  const handleEditSave = (updates: Partial<ChildProfile>) => {
    if (!initialData) return;
    
    // Merge updates with existing data
    const updatedProfile: ChildProfile = {
      ...initialData,
      ...updates,
    };
    
    onSave(updatedProfile);
    onClose();
  };

  const handleInfoComplete = (data: ChildBasicInfo) => {
    setBasicInfo(data);
    setStep('assessment');
  };

  const handleAssessmentComplete = (data: ChildAssessment) => {
    setAssessment(data);
    
    const finalProfile: ChildProfile = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      ...basicInfo,
      nickname: basicInfo.nickname || basicInfo.fullName || '', 
      interests: basicInfo.favoriteTopics,
      age: new Date().getFullYear() - new Date(basicInfo.dateOfBirth).getFullYear(),
      personality: [],
      strengths: [],
      challenges: [],
      assessment: data, // Include assessment data for LLM analysis
      username: basicInfo.username,
      password: basicInfo.password,
    };

    onSave(finalProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      {/* CSS Ẩn Scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide shadow-2xl relative border border-gray-100">
        {/* Header Modal */}
        <div className="sticky top-0 bg-white/95 backdrop-blur p-6 border-b border-gray-200 flex justify-between items-center z-10" style={{ background: 'linear-gradient(to right, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.98))' }}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? `Edit Profile: ${initialData.nickname}` : 'Add New Child Profile'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {initialData ? 'Update your child\'s information' : 'Create a new learning path for your child'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-gray-50/30">
          {isEditMode ? (
            // Edit mode - simple form for basic info only
            initialData && (
              <EditChildForm
                initialData={initialData}
                onSave={handleEditSave}
                onCancel={onClose}
              />
            )
          ) : (
            // Add mode - full onboarding flow
            <>
              {step === 'info' ? (
                <div className="[&>div]:shadow-none [&>div]:border-0"> 
                  <ChildInfoStep 
                    childNumber={1} 
                    totalChildren={1} 
                    initialData={basicInfo} 
                    onComplete={handleInfoComplete}
                    onBack={onClose}
                  />
                </div>
              ) : (
                <div className="[&>div]:shadow-none [&>div]:border-0">
                  <AssessmentStep 
                    childNumber={1} 
                    totalChildren={1} 
                    childName={basicInfo.nickname || basicInfo.fullName}
                    dateOfBirth={basicInfo.dateOfBirth}
                    initialData={assessment}
                    onComplete={handleAssessmentComplete}
                    onBack={() => setStep('info')}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildFormModal;