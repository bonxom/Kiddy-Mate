import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Quote, ArrowLeft, Bot } from 'lucide-react';

// Dịch vụ và dữ liệu API (giả định các paths này là chính xác)
import { completeOnboarding } from '../../api/services/onboardingService';
import { STORAGE_KEYS } from '../../api/client/apiConfig';
import { assessmentQuestionsPrimary, assessmentQuestionsSecondary } from '../../data/assessmentQuestions';

// Các bước Onboarding (giả định các paths này là chính xác)
import ParentInfoStep from '../../features/onboarding/ParentInfoStep';
import ChildInfoStep from '../../features/onboarding/ChildInfoStep';
import AssessmentStep from '../../features/onboarding/AssessmentStep';

// Types (giả định types.auth.types đã định nghĩa các type này)
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

    // 2. Logic tự động chuyển Quote (sau 7 giây)
    useEffect(() => {
        const quoteInterval = setInterval(() => {
            setCurrentQuoteIndex(prevIndex => (prevIndex + 1) % QUOTES.length);
        }, 7000); // Tự động chuyển sau 7 giây

        return () => clearInterval(quoteInterval);
    }, []);

    const currentQuote = QUOTES[currentQuoteIndex];

  // --- LOGIC HANDLERS (Giữ nguyên logic của bạn) ---

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
      const userStr = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (!userStr) {
        alert('Session expired. Please login again.');
        navigate('/login');
        return;
      }
      const user = JSON.parse(userStr);
      
      const allQuestions = [...assessmentQuestionsPrimary, ...assessmentQuestionsSecondary];

      const onboardingRequest = {
        parent_email: user.email,
        parent_display_name: onboardingData.parentInfo.displayName,
        phone_number: onboardingData.parentInfo.phoneNumber || undefined,
        children: onboardingData.children.map(child => {
          const getCategoryAnswers = (category: string) => 
            child.assessment.answers
              .filter(a => allQuestions.find(q => q.id === a.questionId)?.category === category)
              .reduce((acc, a) => ({ ...acc, [a.questionId]: String(a.rating) }), {});

          return {
            full_name: child.basicInfo.fullName,
            nickname: child.basicInfo.nickname || child.basicInfo.fullName,
            date_of_birth: child.basicInfo.dateOfBirth,
            gender: child.basicInfo.gender,
            username: child.basicInfo.username,
            password: child.basicInfo.password,
            favorite_topics: child.basicInfo.favoriteTopics || [],
            discipline_autonomy: getCategoryAnswers('discipline'),
            emotional_intelligence: getCategoryAnswers('emotional'),
            social_interaction: getCategoryAnswers('social'),
          };
        }),
      };

      const response = await completeOnboarding(onboardingRequest);
      
      // Cập nhật trạng thái người dùng
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
    const totalStepsPerChild = 2; // Child Info + Assessment
    const completedChildrenSteps = currentChildIndex * totalStepsPerChild;
    const currentChildStep = currentStep === 'child-info' ? 1 : 2;
    const totalSteps = onboardingData.parentInfo.numberOfChildren * totalStepsPerChild;
    return 10 + ((completedChildrenSteps + currentChildStep) / totalSteps) * 90;
  };

  // --- GIAO DIỆN (Đã cải tiến UI/UX) ---
  return (
    // Container chính: dùng h-screen và overflow-hidden để cố định layout
    <div className="flex h-screen w-full bg-white font-sans overflow-hidden">
      
      {/* ===========================================================
          LEFT COLUMN (BRANDING + ROBOT) - Nền màu xanh đậm
      =========================================================== */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#06325a] relative flex-col justify-between p-12 text-white h-full">
        
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Lớp phủ gradient và nhiễu */}
            <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'linear-gradient(to bottom right, #06325a 0%, #1e40af 100%)', opacity: 0.9 }}></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            
            {/* Mảng màu chuyển động (Framer Motion) */}
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

        {/* ROBOT MASCOT (Center) */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
            <motion.div 
                // Robot bay lơ lửng
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
            >
               {/* Vòng hào quang */}
               <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 rounded-full transform scale-150" />
               
               {/* Icon Robot khổng lồ */}
               <Bot strokeWidth={1} className="w-72 h-72 text-white drop-shadow-[0_0_30px_rgba(103,232,249,0.6)]" />
               
               {/* Bong bóng chat (xuất hiện nhẹ nhàng) */}
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
                <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                    Your AI Companion
                </h2>
                <p className="text-blue-200 text-sm leading-relaxed">
                    I'm here to help you track your child's growth and provide personalized parenting insights.
                </p>
            </div>
        </div>

        {/* Quote (Bottom) */}
        <div className="relative z-10 h-32 flex items-end"> {/* Thêm h-32 để cố định chiều cao */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentQuote.text} // Key thay đổi mỗi lần quote thay đổi để kích hoạt animation
                    initial={{ opacity: 0, y: 15 }} // Vị trí ban đầu (mờ và hơi trượt lên)
                    animate={{ opacity: 1, y: 0 }} // Vị trí cuối cùng
                    exit={{ opacity: 0, y: -15 }} // Hiệu ứng khi biến mất
                    transition={{ duration: 0.5 }}
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
                <motion.div 
                    className="h-full"
                    // Sử dụng style cứng cho gradient thanh tiến trình
                    style={{ background: 'linear-gradient(to right, #3498db, #8e44ad)' }} 
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

                {/* Content with Animate Presence (chuyển đổi bước mượt mà) */}
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