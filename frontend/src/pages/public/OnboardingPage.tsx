import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Quote, ArrowLeft, Bot } from 'lucide-react';

// Dịch vụ và dữ liệu API (giả định các paths này là chính xác)
import { completeOnboarding } from '../../api/services/onboardingService';
import { STORAGE_KEYS } from '../../api/client/apiConfig';
import ParentInfoStep from '../../features/onboarding/ParentInfoStep.tsx';
import ChildInfoStep from '../../features/onboarding/ChildInfoStep.tsx';
import AssessmentStep from '../../features/onboarding/AssessmentStep.tsx';
import { assessmentQuestionsPrimary, assessmentQuestionsSecondary } from '../../data/assessmentQuestions';
import type { OnboardingData, OnboardingStep, ParentInfo, ChildBasicInfo, ChildAssessment } from '../../types/auth.types';

interface QuoteData {
    text: string;
    author: string;
}

const QUOTES: QuoteData[] = [
    {
        text: "The way we talk to our children becomes their inner voice.",
        author: "Peggy O'Mara",
    },
    {
        text: "Children are not things to be molded, but people to be unfolded.",
        author: "Jess Lair",
    },
    {
        text: "The best inheritance a parent can give his children is a few minutes of his time each day.",
        author: "Orlando Aloysius Battista",
    },
    {
        text: "Don't worry that children never listen to you; worry that they are always watching you.",
        author: "Robert Fulghum",
    },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  
  // State quản lý bước hiện tại và dữ liệu
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('parent-info');
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    parentInfo: { displayName: '', phoneNumber: '', numberOfChildren: 1 },
    children: [],
  });

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0); 

    // 2. Logic tự động chuyển Quote (sau 7 giây) - Optimized
    useEffect(() => {
        const quoteInterval = setInterval(() => {
            setCurrentQuoteIndex(prevIndex => (prevIndex + 1) % QUOTES.length);
        }, 7000); // Tự động chuyển sau 7 giây

        return () => clearInterval(quoteInterval);
    }, []);

    const currentQuote = useMemo(() => QUOTES[currentQuoteIndex], [currentQuoteIndex]);

  const handleParentInfoComplete = useCallback((parentInfo: ParentInfo) => {
    setOnboardingData(prev => ({ ...prev, parentInfo }));
    setCurrentStep('child-info');
    setCurrentChildIndex(0);
  }, []);

  const handleChildInfoComplete = useCallback((childInfo: ChildBasicInfo) => {
    setOnboardingData(prev => {
      const updatedChildren = [...prev.children];
      // If child doesn't exist yet, create a new entry
      if (!updatedChildren[currentChildIndex]) {
        updatedChildren[currentChildIndex] = {
          basicInfo: childInfo,
          assessment: { answers: [] }
        };
      } else {
        updatedChildren[currentChildIndex] = { 
          ...updatedChildren[currentChildIndex], 
          basicInfo: childInfo 
        };
      }
      return { ...prev, children: updatedChildren };
    });
    setCurrentStep('assessment');
  }, [currentChildIndex]);

  const handleAssessmentComplete = useCallback((assessment: ChildAssessment) => {
    setOnboardingData(prev => {
      const updatedChildren = [...prev.children];
      // Update assessment for current child (should already exist from handleChildInfoComplete)
      if (updatedChildren[currentChildIndex]) {
        updatedChildren[currentChildIndex] = { 
          ...updatedChildren[currentChildIndex], 
          assessment 
        };
      } else {
        // This shouldn't happen, but handle it gracefully
        console.error('Child info missing when completing assessment');
        return prev;
      }
      
      const newData = { ...prev, children: updatedChildren };
      
      // Check if we should move to next child or finish
      if (currentChildIndex < prev.parentInfo.numberOfChildren - 1) {
        // Move to next child
        setCurrentChildIndex(currentChildIndex + 1);
        setCurrentStep('child-info');
      } else {
        // Finish onboarding - pass the updated data
        handleFinishOnboarding(newData);
      }
      
      return newData;
    });
  }, [currentChildIndex]);

  const handleFinishOnboarding = useCallback(async (data?: OnboardingData) => {
    const finalData = data || onboardingData;
    
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (!userStr) {
        alert('Session expired. Please login again.');
        navigate('/login');
        return;
      }
      const user = JSON.parse(userStr);
      
      const allQuestions = [...assessmentQuestionsPrimary, ...assessmentQuestionsSecondary];

      // Validate required fields before sending
      if (!finalData.parentInfo.displayName || !finalData.parentInfo.displayName.trim()) {
        alert('Please enter your display name');
        return;
      }

      for (let i = 0; i < finalData.children.length; i++) {
        const child = finalData.children[i];
        if (!child.basicInfo.fullName || !child.basicInfo.fullName.trim()) {
          alert(`Please enter full name for child ${i + 1}`);
          return;
        }
        if (!child.basicInfo.dateOfBirth) {
          alert(`Please enter date of birth for child ${i + 1}`);
          return;
        }
        if (!child.basicInfo.username || !child.basicInfo.username.trim()) {
          alert(`Please enter username for child ${i + 1}`);
          return;
        }
        if (!child.basicInfo.password || !child.basicInfo.password.trim()) {
          alert(`Please enter password for child ${i + 1}`);
          return;
        }
        if (!child.assessment || !child.assessment.answers || child.assessment.answers.length === 0) {
          alert(`Please complete the assessment for child ${i + 1}`);
          return;
        }
      }

      const onboardingRequest = {
        parent_email: user.email,
        parent_display_name: finalData.parentInfo.displayName.trim(),
        phone_number: finalData.parentInfo.phoneNumber || undefined,
        children: finalData.children.map(child => {
          const getCategoryAnswers = (category: string) => {
            const answers = child.assessment.answers
              .filter(a => {
                const question = allQuestions.find(q => q.id === a.questionId);
                return question?.category === category;
              })
              .reduce((acc, a) => {
                // Ensure rating is converted to string and not null/undefined
                if (a.rating != null) {
                  acc[a.questionId] = String(a.rating);
                }
                return acc;
              }, {} as Record<string, string>);
            return answers;
          };

          return {
            full_name: child.basicInfo.fullName.trim(),
            nickname: (child.basicInfo.nickname || child.basicInfo.fullName).trim(),
            date_of_birth: child.basicInfo.dateOfBirth,
            gender: child.basicInfo.gender || 'male',
            username: child.basicInfo.username.trim(),
            password: child.basicInfo.password,
            favorite_topics: child.basicInfo.favoriteTopics || [],
            discipline_autonomy: getCategoryAnswers('discipline'),
            emotional_intelligence: getCategoryAnswers('emotional'),
            social_interaction: getCategoryAnswers('social'),
          };
        }),
      };

      // Log request for debugging
      console.log('Sending onboarding request:', JSON.stringify(onboardingRequest, null, 2));

      const response = await completeOnboarding(onboardingRequest);
      
      // Cập nhật trạng thái người dùng
      user.hasCompletedOnboarding = true;
      user.displayName = finalData.parentInfo.displayName;
      if (finalData.parentInfo.phoneNumber) {
        user.phoneNumber = finalData.parentInfo.phoneNumber;
      }
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));

      console.log('Onboarding completed successfully:', response);
      navigate('/parent/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      
      // Extract error message from response
      let errorMessage = 'Failed to complete onboarding. Please try again.';
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  }, [onboardingData, navigate]);

  const handleBack = () => {
    if (currentStep === 'assessment') setCurrentStep('child-info');
    else if (currentStep === 'child-info' && currentChildIndex > 0) {
      setCurrentChildIndex(currentChildIndex - 1);
      setCurrentStep('assessment');
    } else if (currentStep === 'child-info') setCurrentStep('parent-info');
  };

  const progress = useMemo(() => {
    if (currentStep === 'parent-info') return 10;
    const totalStepsPerChild = 2; // Child Info + Assessment
    const completedChildrenSteps = currentChildIndex * totalStepsPerChild;
    const currentChildStep = currentStep === 'child-info' ? 1 : 2;
    const totalSteps = onboardingData.parentInfo.numberOfChildren * totalStepsPerChild;
    return 10 + ((completedChildrenSteps + currentChildStep) / totalSteps) * 90;
  }, [currentStep, currentChildIndex, onboardingData.parentInfo.numberOfChildren]);

  // --- GIAO DIỆN (Đã cải tiến UI/UX) ---
  return (
    // Container chính: dùng h-screen và overflow-hidden để cố định layout
    <div className="flex h-screen w-full bg-white font-sans overflow-hidden">
      
      {/* ===========================================================
          LEFT COLUMN (BRANDING + ROBOT) - Nền màu xanh đậm
      =========================================================== */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#06325a] relative flex-col justify-between p-12 text-white h-full">
        
        {/* Background Effects - Optimized for performance */}
        <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Lớp phủ gradient - Static, no animation */}
            <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'linear-gradient(to bottom right, #06325a 0%, #1e40af 100%)', opacity: 0.9 }}></div>
            
            {/* Simplified background blobs - Reduced blur and opacity for better performance */}
            <div 
                className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay opacity-30"
                style={{ 
                    filter: 'blur(60px)',
                    transform: 'scale(1)',
                    willChange: 'transform'
                }}
            />
            <div 
                className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600 rounded-full mix-blend-overlay opacity-20"
                style={{ 
                    filter: 'blur(70px)',
                    willChange: 'transform'
                }}
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

        {/* ROBOT MASCOT (Center) - Optimized animation */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
            <div 
                className="relative"
                style={{
                    animation: 'float 6s ease-in-out infinite',
                    willChange: 'transform'
                }}
            >
              {/* Vòng hào quang - Reduced blur for performance */}
              <div className="absolute inset-0 bg-cyan-500 opacity-15 rounded-full transform scale-150" style={{ filter: 'blur(40px)' }} />
               
               {/* Icon Robot khổng lồ */}
               <Bot strokeWidth={1} className="w-72 h-72 text-white drop-shadow-[0_0_30px_rgba(103,232,249,0.6)]" />
               
              {/* Bong bóng chat - Static after initial render */}
              <div className="absolute -top-4 -right-12 bg-white text-[#06325a] px-4 py-2 rounded-xl rounded-bl-none shadow-lg font-bold text-sm whitespace-nowrap">
                 Hi there! 👋
              </div>
            </div>
            
            {/* CSS Animation for floating effect */}
            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-15px); }
              }
            `}</style>

            <div className="mt-10 text-center max-w-xs">
                <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-linear-to-r from-white to-blue-200">
                    Your AI Companion
                </h2>
                <p className="text-blue-200 text-sm leading-relaxed">
                    I'm here to help you track your child's growth and provide personalized parenting insights.
                </p>
            </div>
        </div>

        {/* Quote (Bottom) - Simplified animation */}
        <div className="relative z-10 h-32 flex items-end">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentQuote.text}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute w-full"
                >
                    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex gap-3 items-start">
                        <Quote className="w-5 h-5 text-cyan-300 shrink-0 mt-1 opacity-70" />
                        <div>
                            <p className="text-sm font-medium text-blue-100 italic leading-relaxed">
                                "{currentQuote.text}"
                            </p>
                            <p className="mt-2 text-xs font-bold text-cyan-200 uppercase tracking-wider">
                                — {currentQuote.author}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
      </div>

      {/* ===========================================================
          RIGHT COLUMN (FORM AREA) - Có thể cuộn
      =========================================================== */}
      <div className="flex-1 flex flex-col relative **bg-white** h-full overflow-y-auto">
        
        {/* Progress Bar (Sticky Top) */}
        <div className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm">
            <div className="h-1.5 w-full bg-slate-100">
                <div 
                    className="h-full transition-all duration-500 ease-out"
                    style={{ 
                        background: 'linear-gradient(to right, #3498db, #8e44ad)',
                        width: `${progress}%`,
                        willChange: 'width'
                    }}
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

        {/* Form Content - Thêm padding top/bottom lớn (py-12) */}
        <div className="flex-1 flex flex-col items-center p-4 py-12">
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

                {/* Content with Animate Presence - Optimized transitions */}
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
                            initialData={onboardingData.children[currentChildIndex]?.basicInfo || {
                                fullName: '',
                                dateOfBirth: '',
                                gender: 'male',
                                username: '',
                                password: '',
                                favoriteTopics: []
                            }}
                            onComplete={handleChildInfoComplete}
                            onBack={handleBack}
                        />
                    )}

                    {currentStep === 'assessment' && (
                        <AssessmentStep
                            key={`assessment-${currentChildIndex}`}
                            childNumber={currentChildIndex + 1}
                            totalChildren={onboardingData.parentInfo.numberOfChildren}
                            childName={onboardingData.children[currentChildIndex]?.basicInfo.nickname || onboardingData.children[currentChildIndex]?.basicInfo.fullName || ''}
                            dateOfBirth={onboardingData.children[currentChildIndex]?.basicInfo.dateOfBirth || ''}
                            initialData={onboardingData.children[currentChildIndex]?.assessment || { answers: [] }}
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