import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Quote, ArrowLeft, Bot } from 'lucide-react';
import { completeOnboarding } from '../../api/services/onboardingService';
import { STORAGE_KEYS } from '../../api/client/apiConfig';
import { assessmentQuestionsPrimary, assessmentQuestionsSecondary } from '../../data/assessmentQuestions';

import ParentInfoStep from '../../features/onboarding/ParentInfoStep';
import ChildInfoStep from '../../features/onboarding/ChildInfoStep';
import AssessmentStep from '../../features/onboarding/AssessmentStep';

import type { OnboardingData, OnboardingStep, ParentInfo, ChildBasicInfo, ChildAssessment } from '../../types/auth.types';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('parent-info');
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    parentInfo: { displayName: '', phoneNumber: '', numberOfChildren: 1 },
    children: [],
  });

  // --- LOGIC HANDLERS (Giữ nguyên không đổi) ---
  const handleParentInfoComplete = (parentInfo: ParentInfo) => {
    setOnboardingData({
      ...onboardingData,
      parentInfo,
      children: Array(parentInfo.numberOfChildren).fill(null).map(() => ({
        basicInfo: { fullName: '', nickname: '', dateOfBirth: '', gender: 'male', username: '', password: '', favoriteTopics: [] },
        assessment: { answers: [] },
      })),
    });
    setCurrentChildIndex(0);
    setCurrentStep('child-info');
  };

  const handleChildInfoComplete = (childInfo: ChildBasicInfo) => {
    const updatedChildren = [...onboardingData.children];
    updatedChildren[currentChildIndex] = { ...updatedChildren[currentChildIndex], basicInfo: childInfo };
    setOnboardingData({ ...onboardingData, children: updatedChildren });
    setCurrentStep('assessment');
  };

  const handleAssessmentComplete = (assessment: ChildAssessment) => {
    const updatedChildren = [...onboardingData.children];
    updatedChildren[currentChildIndex] = { ...updatedChildren[currentChildIndex], assessment };
    setOnboardingData({ ...onboardingData, children: updatedChildren });

    if (currentChildIndex < onboardingData.parentInfo.numberOfChildren - 1) {
      setCurrentChildIndex(currentChildIndex + 1);
      setCurrentStep('child-info');
    } else {
      handleFinishOnboarding();
    }
  };

  const handleFinishOnboarding = async () => {
    try {
      // Get user email from localStorage
      const userStr = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (!userStr) {
        alert('Session expired. Please login again.');
        navigate('/login');
        return;
      }
      const user = JSON.parse(userStr);
      
      // Transform onboarding data to API format
      const onboardingRequest = {
        parent_email: user.email,
        parent_display_name: onboardingData.parentInfo.displayName,
        phone_number: onboardingData.parentInfo.phoneNumber || undefined,
        children: onboardingData.children.map(child => ({
          full_name: child.basicInfo.fullName,
          nickname: child.basicInfo.nickname || child.basicInfo.fullName,
          date_of_birth: child.basicInfo.dateOfBirth,
          gender: child.basicInfo.gender,
          username: child.basicInfo.username,
          password: child.basicInfo.password,
          favorite_topics: child.basicInfo.favoriteTopics || [],
          discipline_autonomy: child.assessment.answers
            .filter(a => {
              const q = [...assessmentQuestionsPrimary, ...assessmentQuestionsSecondary]
                .find(q => q.id === a.questionId);
              return q?.category === 'discipline';
            })
            .reduce((acc, a) => ({ ...acc, [a.questionId]: String(a.rating) }), {}),
          emotional_intelligence: child.assessment.answers
            .filter(a => {
              const q = [...assessmentQuestionsPrimary, ...assessmentQuestionsSecondary]
                .find(q => q.id === a.questionId);
              return q?.category === 'emotional';
            })
            .reduce((acc, a) => ({ ...acc, [a.questionId]: String(a.rating) }), {}),
          social_interaction: child.assessment.answers
            .filter(a => {
              const q = [...assessmentQuestionsPrimary, ...assessmentQuestionsSecondary]
                .find(q => q.id === a.questionId);
              return q?.category === 'social';
            })
            .reduce((acc, a) => ({ ...acc, [a.questionId]: String(a.rating) }), {}),
        })),
      };

      // Call API to complete onboarding
      const response = await completeOnboarding(onboardingRequest);
      
      // Update user in localStorage (already have user object from above)
      user.hasCompletedOnboarding = true;
      user.displayName = onboardingData.parentInfo.displayName;
      if (onboardingData.parentInfo.phoneNumber) {
        user.phoneNumber = onboardingData.parentInfo.phoneNumber;
      }
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));

      console.log('Onboarding completed successfully:', response);
      navigate('/parent/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to complete onboarding. Please try again.');
    }
  };

  const handleBack = () => {
    if (currentStep === 'assessment') setCurrentStep('child-info');
    else if (currentStep === 'child-info' && currentChildIndex > 0) {
      setCurrentChildIndex(currentChildIndex - 1);
      setCurrentStep('assessment');
    } else if (currentStep === 'child-info') setCurrentStep('parent-info');
  };

  const calculateProgress = () => {
    if (currentStep === 'parent-info') return 10;
    const totalStepsPerChild = 2; 
    const completedChildrenSteps = currentChildIndex * totalStepsPerChild;
    const currentChildStep = currentStep === 'child-info' ? 1 : 2;
    const totalSteps = onboardingData.parentInfo.numberOfChildren * totalStepsPerChild;
    return 10 + ((completedChildrenSteps + currentChildStep) / totalSteps) * 90;
  };

  return (
    // FIX 1: Dùng h-screen và overflow-hidden cho container cha
    // Điều này đảm bảo trang web KHÔNG BAO GIỜ có scrollbar ở cấp độ body
    <div className="flex h-screen w-full bg-white font-sans overflow-hidden">
      
      {/* ===========================================================
          LEFT COLUMN (BRANDING + ROBOT)
          FIX 2: h-full để nó cao bằng màn hình cha, không hơn không kém
      =========================================================== */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#06325a] relative flex-col justify-between p-12 text-white h-full">
        
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-[#06325a] to-[#1e40af] opacity-90"></div>
            {/* Tech grid lines decoration */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            
            <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }} 
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-40" 
            />
             <motion.div 
                animate={{ scale: [1, 1.5, 1], x: [0, -50, 0] }} 
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-overlay filter blur-[120px] opacity-30" 
            />
        </div>

        {/* Branding (Top) */}
        <div className="relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shadow-glow-accent">
                    <Sparkles className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Kiddy-Mate</h1>
                    <p className="text-xs text-blue-200 tracking-widest uppercase">AI Parenting Assistant</p>
                </div>
            </div>
        </div>

        {/* ROBOT MASCOT (Center) - Thay đổi tại đây */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
            <motion.div 
                // Hiệu ứng Robot bay lơ lửng lên xuống
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
            >
               {/* Vòng hào quang sau lưng Robot */}
               <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 rounded-full transform scale-150" />
               
               {/* Nếu bạn có ảnh Robot 3D (png), hãy dùng thẻ img ở đây: */}
               {/* <img src="/path/to/robot-3d.png" alt="Robot Friend" className="w-80 h-auto drop-shadow-2xl" /> */}

               {/* Hiện tại dùng Icon Robot khổng lồ làm placeholder */}
               <Bot strokeWidth={1} className="w-72 h-72 text-white drop-shadow-[0_0_30px_rgba(103,232,249,0.6)]" />
               
               {/* Bong bóng chat */}
               <motion.div 
                 initial={{ opacity: 0, scale: 0, x: 50 }}
                 animate={{ opacity: 1, scale: 1, x: 0 }}
                 transition={{ delay: 1, type: 'spring' }}
                 className="absolute -top-4 -right-12 bg-white text-[#06325a] px-4 py-2 rounded-xl rounded-bl-none shadow-lg font-bold text-sm whitespace-nowrap"
               >
                 Hi there! 👋
               </motion.div>
            </motion.div>

            <div className="mt-10 text-center max-w-xs">
                <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-linear-to-r from-white to-blue-200">
                    Your AI Companion
                </h2>
                <p className="text-blue-200 text-sm leading-relaxed">
                    I'm here to help you track your child's growth and provide personalized parenting insights.
                </p>
            </div>
        </div>

        {/* Quote (Bottom) */}
        <div className="relative z-10">
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex gap-3 items-start">
                <Quote className="w-5 h-5 text-cyan-300 shrink-0 mt-1 opacity-70" />
                <div>
                    <p className="text-sm font-medium text-blue-100 italic leading-relaxed">
                        "The way we talk to our children becomes their inner voice."
                    </p>
                    <p className="mt-2 text-xs font-bold text-cyan-200 uppercase tracking-wider">— Peggy O'Mara</p>
                </div>
            </div>
        </div>
      </div>

      {/* ===========================================================
          RIGHT COLUMN (FORM AREA)
          FIX 3: overflow-y-auto để chỉ phần này cuộn
      =========================================================== */}
      <div className="flex-1 flex flex-col relative bg-slate-50 h-full overflow-hidden">
        
        {/* Progress Bar (Sticky Top) */}
        <div className="relative z-50 w-full bg-white border-b border-slate-100 shadow-sm">
            <div className="h-1.5 w-full bg-slate-100">
                <motion.div 
                    className="h-full bg-gradient-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProgress()}%` }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                />
            </div>
            
            {/* Mobile Header */}
            <div className="lg:hidden p-4 flex justify-between items-center bg-white">
                 <div className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-[#06325a]" />
                    <span className="font-bold text-[#06325a]">Kiddy-Mate</span>
                 </div>
                 <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                    Step {currentStep === 'parent-info' ? 1 : currentStep === 'child-info' ? 2 : 3}
                 </span>
            </div>
        </div>

        {/* Form Content - Fit to screen */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-2xl">
                
                {/* Back Button */}
                {currentStep !== 'parent-info' && (
                    <button 
                        onClick={handleBack}
                        className="mb-3 group flex items-center gap-2 text-slate-400 hover:text-[#06325a] transition-all text-xs font-medium"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-[#06325a] transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Back to previous step
                    </button>
                )}

                {/* Content with Animate Presence */}
                <AnimatePresence mode='wait'>
                    {currentStep === 'parent-info' && (
                        <ParentInfoStep
                            key="parent-info"
                            initialData={onboardingData.parentInfo}
                            onComplete={handleParentInfoComplete}
                        />
                    )}

                    {currentStep === 'child-info' && (
                        <ChildInfoStep
                            key={`child-info-${currentChildIndex}`}
                            childNumber={currentChildIndex + 1}
                            totalChildren={onboardingData.parentInfo.numberOfChildren}
                            initialData={onboardingData.children[currentChildIndex]?.basicInfo}
                            onComplete={handleChildInfoComplete}
                            onBack={handleBack}
                        />
                    )}

                    {currentStep === 'assessment' && (
                        <AssessmentStep
                            key={`assessment-${currentChildIndex}`}
                            childNumber={currentChildIndex + 1}
                            totalChildren={onboardingData.parentInfo.numberOfChildren}
                            childName={onboardingData.children[currentChildIndex]?.basicInfo.nickname || onboardingData.children[currentChildIndex]?.basicInfo.fullName}
                            dateOfBirth={onboardingData.children[currentChildIndex]?.basicInfo.dateOfBirth}
                            initialData={onboardingData.children[currentChildIndex]?.assessment}
                            onComplete={handleAssessmentComplete}
                            onBack={handleBack}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;