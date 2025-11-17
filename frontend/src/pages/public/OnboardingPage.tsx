import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentInfoStep from '../../features/onboarding/ParentInfoStep.tsx';
import ChildInfoStep from '../../features/onboarding/ChildInfoStep.tsx';
import AssessmentStep from '../../features/onboarding/AssessmentStep.tsx';
import type { OnboardingData, OnboardingStep, ParentInfo, ChildBasicInfo, ChildAssessment } from '../../types/auth.types';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('parent-info');
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
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
      // TODO: Send onboardingData to API
      console.log('Complete onboarding data:', onboardingData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to parent dashboard
      navigate('/parent/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
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
          initialData={onboardingData.children[currentChildIndex]?.assessment}
          onComplete={handleAssessmentComplete}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default OnboardingPage;
