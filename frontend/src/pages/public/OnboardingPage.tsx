import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeOnboarding, type ChildOnboardingData, type OnboardingRequest } from '../../api/services/onboardingService';
import { STORAGE_KEYS } from '../../api/client/apiConfig';
import ParentInfoStep from '../../features/onboarding/ParentInfoStep.tsx';
import ChildInfoStep from '../../features/onboarding/ChildInfoStep.tsx';
import AssessmentStep from '../../features/onboarding/AssessmentStep.tsx';
import type { OnboardingData, OnboardingStep, ParentInfo, ChildBasicInfo, ChildAssessment } from '../../types/auth.types';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('parent-info');
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  
  console.log('[OnboardingPage] Render:', { currentStep, currentChildIndex });
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    parentInfo: {
      displayName: '',
      phoneNumber: '',
      numberOfChildren: 1,
    },
    children: [],
  });

  const handleParentInfoComplete = (parentInfo: ParentInfo) => {
    setOnboardingData({
      ...onboardingData,
      parentInfo,
      children: Array(parentInfo.numberOfChildren).fill(null).map(() => ({
        basicInfo: {
          fullName: '',
          nickname: '',
          dateOfBirth: '',
          gender: 'male',
          favoriteTopics: [],
        },
        assessment: {
          answers: [],
        },
      })),
    });
    setCurrentChildIndex(0);
    setCurrentStep('child-info');
  };

  const handleChildInfoComplete = (childInfo: ChildBasicInfo) => {
    const updatedChildren = [...onboardingData.children];
    updatedChildren[currentChildIndex] = {
      ...updatedChildren[currentChildIndex],
      basicInfo: childInfo,
    };
    setOnboardingData({ ...onboardingData, children: updatedChildren });
    setCurrentStep('assessment');
  };

  const handleAssessmentComplete = (assessment: ChildAssessment) => {
    const updatedChildren = [...onboardingData.children];
    updatedChildren[currentChildIndex] = {
      ...updatedChildren[currentChildIndex],
      assessment,
    };
    setOnboardingData({ ...onboardingData, children: updatedChildren });

    // Check if there are more children to onboard
    if (currentChildIndex < onboardingData.parentInfo.numberOfChildren - 1) {
      setCurrentChildIndex(currentChildIndex + 1);
      setCurrentStep('child-info');
    } else {
      // All children completed - finish onboarding
      handleFinishOnboarding();
    }
  };

  const handleFinishOnboarding = async () => {
    try {
      // Transform onboarding data to API format
      const onboardingRequest: OnboardingRequest = {
        parent_display_name: onboardingData.parentInfo.displayName,
        phone_number: onboardingData.parentInfo.phoneNumber,
        children: onboardingData.children.map((child) => {
          // Group assessment answers by category
          const disciplineAnswers: Record<string, string | null> = {};
          const emotionalAnswers: Record<string, string | null> = {};
          const socialAnswers: Record<string, string | null> = {};

          child.assessment.answers.forEach((answer) => {
            const key = answer.questionId;
            const value = answer.rating.toString();

            // Determine category based on questionId prefix
            if (key.startsWith('discipline_')) {
              disciplineAnswers[key] = value;
            } else if (key.startsWith('emotional_')) {
              emotionalAnswers[key] = value;
            } else if (key.startsWith('social_')) {
              socialAnswers[key] = value;
            }
          });

          const childData: ChildOnboardingData = {
            full_name: child.basicInfo.fullName,
            nickname: child.basicInfo.nickname || '',
            date_of_birth: child.basicInfo.dateOfBirth,
            gender: child.basicInfo.gender,
            favorite_topics: child.basicInfo.favoriteTopics,
            discipline_autonomy: disciplineAnswers,
            emotional_intelligence: emotionalAnswers,
            social_interaction: socialAnswers,
          };

          return childData;
        }),
      };

      // Call API to complete onboarding
      const result = await completeOnboarding(onboardingRequest);
      console.log('Onboarding completed:', result);

      // Update user in localStorage
      const userStr = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (userStr) {
        const user = JSON.parse(userStr);
        user.hasCompletedOnboarding = true;
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      }

      // Navigate to parent dashboard (ChildProvider will auto-load children)
      navigate('/parent/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to complete onboarding. Please try again.');
    }
  };

  const handleBack = () => {
    if (currentStep === 'assessment') {
      setCurrentStep('child-info');
    } else if (currentStep === 'child-info' && currentChildIndex > 0) {
      setCurrentChildIndex(currentChildIndex - 1);
      setCurrentStep('assessment');
    } else if (currentStep === 'child-info') {
      setCurrentStep('parent-info');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      {currentStep === 'parent-info' && (
        <ParentInfoStep
          initialData={onboardingData.parentInfo}
          onComplete={handleParentInfoComplete}
        />
      )}

      {currentStep === 'child-info' && (
        <ChildInfoStep
          childNumber={currentChildIndex + 1}
          totalChildren={onboardingData.parentInfo.numberOfChildren}
          initialData={onboardingData.children[currentChildIndex]?.basicInfo}
          onComplete={handleChildInfoComplete}
          onBack={handleBack}
        />
      )}

      {currentStep === 'assessment' && (
        <AssessmentStep
          childNumber={currentChildIndex + 1}
          totalChildren={onboardingData.parentInfo.numberOfChildren}
          childName={onboardingData.children[currentChildIndex]?.basicInfo.nickname || onboardingData.children[currentChildIndex]?.basicInfo.fullName}
          dateOfBirth={onboardingData.children[currentChildIndex]?.basicInfo.dateOfBirth}
          initialData={onboardingData.children[currentChildIndex]?.assessment}
          onComplete={handleAssessmentComplete}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default OnboardingPage;
