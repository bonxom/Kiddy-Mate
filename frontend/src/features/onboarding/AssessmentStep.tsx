import { useState, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, Heart, Users, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { 
  assessmentQuestionsPrimary, 
  assessmentQuestionsSecondary, 
  ratingLabels 
} from '../../data/assessmentQuestions';
import type { ChildAssessment, AssessmentAnswer, AssessmentCategory } from '../../types/auth.types';

interface AssessmentStepProps {
  childNumber: number;
  totalChildren: number;
  childName: string;
  dateOfBirth: string; // THÊM: Cần ngày sinh để xác định bộ câu hỏi
  initialData: ChildAssessment;
  onComplete: (data: ChildAssessment) => void;
  onBack: () => void;
}

const AssessmentStep = ({ 
  childNumber, 
  totalChildren, 
  childName, 
  dateOfBirth,
  initialData, 
  onComplete, 
  onBack 
}: AssessmentStepProps) => {
  const [answers, setAnswers] = useState<AssessmentAnswer[]>(initialData.answers || []);
  const [activeCategory, setActiveCategory] = useState<AssessmentCategory>('discipline');

  // --- LOGIC XÁC ĐỊNH ĐỘ TUỔI & CÂU HỎI ---
  const relevantQuestions = useMemo(() => {
    if (!dateOfBirth) return assessmentQuestionsPrimary;
    
    const birthYear = new Date(dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    // Nếu > 10 tuổi dùng bộ Secondary, ngược lại dùng Primary
    return age > 10 ? assessmentQuestionsSecondary : assessmentQuestionsPrimary;
  }, [dateOfBirth]);

  const categories: Array<{ id: AssessmentCategory; label: string; icon: any; color: string }> = [
    { id: 'discipline', label: 'Kỷ luật & Tự lập', icon: CheckCircle2, color: 'from-blue-500 to-cyan-500' },
    { id: 'emotional', label: 'Trí tuệ Cảm xúc', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { id: 'social', label: 'Kỹ năng Xã hội', icon: Users, color: 'from-purple-500 to-indigo-500' },
  ];

  const questionsForCategory = relevantQuestions.filter(q => q.category === activeCategory);
  
  const getAnswerForQuestion = (questionId: string): number | undefined => {
    return answers.find(a => a.questionId === questionId)?.rating;
  };

  const setAnswerForQuestion = (questionId: string, rating: 1 | 2 | 3 | 4 | 5) => {
    const existingIndex = answers.findIndex(a => a.questionId === questionId);
    let newAnswers = [...answers];
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex] = { questionId, rating };
    } else {
      newAnswers.push({ questionId, rating });
    }
    
    setAnswers(newAnswers);
  };

  const getCategoryProgress = (category: AssessmentCategory): number => {
    const categoryQuestions = relevantQuestions.filter(q => q.category === category);
    const answeredCount = categoryQuestions.filter(q => 
      answers.some(a => a.questionId === q.id)
    ).length;
    return categoryQuestions.length > 0 ? (answeredCount / categoryQuestions.length) * 100 : 0;
  };

  const allQuestionsAnswered = relevantQuestions.every(q => 
    answers.some(a => a.questionId === q.id)
  );

  const handleSubmit = () => {
    if (allQuestionsAnswered) {
      onComplete({ answers });
    }
  };

  const handleNext = () => {
    const currentIndex = categories.findIndex(c => c.id === activeCategory);
    if (currentIndex < categories.length - 1) {
      setActiveCategory(categories[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll lên đầu khi chuyển tab
    } else if (allQuestionsAnswered) {
      handleSubmit();
    }
  };

  const canProceedToNext = questionsForCategory.every(q => 
    answers.some(a => a.questionId === q.id)
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-linear-to-br from-blue-100 via-purple-100 to-pink-200 relative overflow-hidden">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-4xl relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="primary" className="mb-4 text-base px-6 py-2 bg-linear-to-r from-orange-600 to-pink-600 shadow-medium">
            Child {childNumber} of {totalChildren} - {childName}
          </Badge>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent mb-3">
            Assessment Questionnaire 📋
          </h1>
          <p className="text-lg text-gray-700 font-medium">
             Help us understand {childName}'s current abilities 
             {/* Hiển thị nhóm tuổi đang đánh giá */}
             <span className="block text-sm text-purple-600 mt-1 font-bold">
               (Applying {relevantQuestions === assessmentQuestionsSecondary ? 'Secondary' : 'Primary'} Framework)
             </span>
          </p>
        </div>

        {/* Progress Indicator (Giữ nguyên như cũ) */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-medium">✓</div>
              <span className="text-sm font-medium text-gray-500">Parent Info</span>
            </div>
            <div className="w-16 h-1.5 bg-linear-to-r from-green-400 to-green-500 rounded-full shadow-soft" />
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-medium">✓</div>
              <span className="text-sm font-medium text-gray-500">Child Info</span>
            </div>
            <div className="w-16 h-1.5 bg-linear-to-r from-green-400 to-purple-400 rounded-full shadow-soft" />
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center text-sm font-bold shadow-medium">3</div>
              <span className="text-sm font-bold text-gray-900">Assessment</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const progress = getCategoryProgress(category.id);
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                    isActive
                      ? 'border-purple-500 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 shadow-glow-accent scale-105'
                      : 'border-gray-200 hover:border-purple-300 bg-white/90 backdrop-blur-sm hover:scale-102'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${category.color} flex items-center justify-center shadow-medium`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-base font-bold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                      {category.label}
                    </span>
                  </div>
                  
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-linear-to-r ${category.color} transition-all duration-500 shadow-soft`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-600 mt-2">
                    {Math.round(progress)}% complete
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Questions Card */}
        <Card padding="lg" className="bg-white/95 backdrop-blur-sm shadow-strong border border-white/50">
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                {categories.find(c => c.id === activeCategory)?.label}
              </h2>
              <Badge variant="info">
                {questionsForCategory.filter(q => answers.some(a => a.questionId === q.id)).length} / {questionsForCategory.length} answered
              </Badge>
            </div>

            {questionsForCategory.map((question, index) => {
              const currentAnswer = getAnswerForQuestion(question.id);
              
              return (
                <div key={question.id} className="pb-6 border-b border-gray-100 last:border-0">
                  <div className="mb-4">
                    <div className="flex items-start gap-3 mb-2">
                      <Badge variant="default" className="shrink-0 bg-gray-100 text-gray-600">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {question.question}
                        </h3>
                        {question.description && (
                          <p className="text-sm text-gray-600 italic">
                            {question.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating Buttons */}
                  <div className="grid grid-cols-5 gap-3">
                    {ratingLabels.map((rating) => {
                      const isSelected = currentAnswer === rating.value;
                      
                      return (
                        <button
                          key={rating.value}
                          type="button"
                          onClick={() => setAnswerForQuestion(question.id, rating.value as 1 | 2 | 3 | 4 | 5)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                            isSelected
                              ? 'border-purple-500 bg-linear-to-br from-blue-50 to-purple-50 shadow-glow-accent scale-105'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:scale-102'
                          }`}
                        >
                          <span className={`text-2xl sm:text-3xl transition-transform ${isSelected ? 'scale-125' : ''}`}>
                            {rating.emoji}
                          </span>
                          <span className={`text-[10px] sm:text-xs font-bold text-center ${isSelected ? 'text-purple-700' : 'text-gray-600'}`}>
                            {rating.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 mt-6 border-t-2 border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              icon={<ArrowLeft className="w-5 h-5" />}
              className="hover:scale-105 transition-transform"
            >
              Back
            </Button>
            
            <div className="flex gap-3">
              {activeCategory !== 'social' ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleNext}
                  disabled={!canProceedToNext}
                  className="hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Category →
                </Button>
              ) : null}
              
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered}
                size="lg"
                icon={<CheckCircle2 className="w-5 h-5" />}
                className="bg-linear-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 shadow-glow-accent hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {childNumber < totalChildren ? 'Next Child 🎉' : 'Complete Onboarding 🚀'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Progress Summary */}
        <div className="mt-6 p-5 bg-linear-to-r from-blue-100 via-purple-100 to-pink-100 rounded-2xl border-2 border-purple-200 shadow-soft">
          <p className="text-sm text-gray-800 leading-relaxed text-center sm:text-left">
            <span className="font-bold text-purple-700">📊 Overall Progress:</span> {answers.length} / {relevantQuestions.length} questions answered 
            <span className="ml-2 inline-flex items-center gap-1 bg-white/80 px-3 py-1 rounded-full font-bold text-purple-700 shadow-sm">
              {relevantQuestions.length > 0 ? Math.round((answers.length / relevantQuestions.length) * 100) : 0}%
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentStep;