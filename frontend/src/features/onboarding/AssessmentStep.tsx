import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { assessmentQuestionsPrimary, assessmentQuestionsSecondary } from '../../data/assessmentQuestions';
import type { AssessmentAnswer, AssessmentCategory, ChildAssessment } from '../../types/auth.types';

interface AssessmentStepProps {
  childNumber: number;
  totalChildren: number;
  childName: string;
  dateOfBirth: string;
  initialData: ChildAssessment;
  onComplete: (data: ChildAssessment) => void;
  onBack: () => void;
}

const ratingEmojis = [
  { value: 1, emoji: '😢', label: 'Never', color: 'text-red-500' },
  { value: 2, emoji: '😕', label: 'Rarely', color: 'text-orange-500' },
  { value: 3, emoji: '😐', label: 'Sometimes', color: 'text-gray-500' },
  { value: 4, emoji: '😊', label: 'Often', color: 'text-blue-500' },
  { value: 5, emoji: '🤩', label: 'Always', color: 'text-green-500' },
];

const categoryInfo: Record<AssessmentCategory, { icon: string; color: string; title: string }> = {
  discipline: { icon: '✅', color: 'bg-blue-500', title: 'Discipline' },
  emotional: { icon: '💖', color: 'bg-pink-500', title: 'Emotional' },
  social: { icon: '🤝', color: 'bg-purple-500', title: 'Social' },
};

const AssessmentStep = ({ 
  childName, dateOfBirth, initialData, onComplete 
}: AssessmentStepProps) => {
  const [answers, setAnswers] = useState<AssessmentAnswer[]>(initialData.answers || []);
  const [currentQuestionIndices, setCurrentQuestionIndices] = useState<Record<AssessmentCategory, number>>({
    discipline: 0,
    emotional: 0,
    social: 0,
  });
  const [expandedCategory, setExpandedCategory] = useState<AssessmentCategory | null>(null);

  const relevantQuestions = useMemo(() => {
    if (!dateOfBirth) return assessmentQuestionsPrimary;
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    return age > 10 ? assessmentQuestionsSecondary : assessmentQuestionsPrimary;
  }, [dateOfBirth]);

  const categories: AssessmentCategory[] = ['discipline', 'emotional', 'social'];

  const setAnswer = (questionId: string, rating: number, category: AssessmentCategory) => {
    const newAnswers = answers.filter(a => a.questionId !== questionId);
    newAnswers.push({ questionId, rating: rating as 1 | 2 | 3 | 4 | 5 });
    setAnswers(newAnswers);
    
    // Auto-advance to next question in the same category
    setTimeout(() => {
      const questionsInCategory = relevantQuestions.filter(q => q.category === category);
      const currentIndex = currentQuestionIndices[category];
      if (currentIndex < questionsInCategory.length - 1) {
        setCurrentQuestionIndices({
          ...currentQuestionIndices,
          [category]: currentIndex + 1
        });
      }
    }, 400);
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-xl p-5 border border-slate-100 w-full flex flex-col max-h-[calc(100vh-8rem)] overflow-hidden"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <div className="w-full flex-1 flex flex-col min-h-0">
        <div className="text-center mb-4 shrink-0">
          <Badge variant="warning" className="mb-2 bg-orange-100 text-orange-800 border-orange-200 text-xs">
            Assessment for {childName}
          </Badge>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Questionnaire 📋</h1>
          <p className="text-xs text-gray-500">Answer questions for each category below</p>
        </div>

        {/* Three Category Rows - Each with inline question */}
        <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
          {categories.map((cat) => {
            const questionsInCategory = relevantQuestions.filter(q => q.category === cat);
            const currentIndex = currentQuestionIndices[cat];
            const currentQuestion = questionsInCategory[currentIndex];
            const answered = questionsInCategory.filter(q => answers.some(a => a.questionId === q.id)).length;
            const total = questionsInCategory.length;
            const percent = total > 0 ? (answered / total) * 100 : 0;
            const isComplete = answered === total;
            const currentAnswer = currentQuestion ? answers.find(a => a.questionId === currentQuestion.id)?.rating : undefined;

            const isExpanded = expandedCategory === cat;
            const showQuestionCard = !isComplete || isExpanded;

            return (
              <div
                key={cat}
                className={`rounded-xl border-2 transition-all ${
                  isComplete ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'
                }`}
              >
                {/* Category Header */}
                <div 
                  className={`p-3 border-b border-slate-100 ${
                    isComplete ? 'cursor-pointer hover:bg-green-100/50' : ''
                  }`}
                  onClick={() => {
                    if (isComplete) {
                      setExpandedCategory(isExpanded ? null : cat);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${categoryInfo[cat].color} flex items-center justify-center text-base`}>
                        {categoryInfo[cat].icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{categoryInfo[cat].title}</h3>
                        <p className="text-[10px] text-gray-500">
                          {answered} / {total} answered
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isComplete && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-xs font-bold text-gray-600">{Math.round(percent)}%</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full ${categoryInfo[cat].color} transition-all duration-500`} style={{ width: `${percent}%` }} />
                  </div>
                </div>

                {/* Question Card - Show if not complete OR expanded */}
                {showQuestionCard && currentQuestion && (
                  <div className="p-3">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="mb-3">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Q{currentIndex + 1}/{total}
                          </span>
                          <h4 className="text-sm font-semibold text-gray-900 mt-1 leading-snug">
                            {currentQuestion.question}
                          </h4>
                        </div>

                        <div className="grid grid-cols-5 gap-1.5">
                          {ratingEmojis.map((r) => {
                            const isSelected = currentAnswer === r.value;
                            return (
                              <button
                                key={r.value}
                                onClick={() => setAnswer(currentQuestion.id, r.value, cat)}
                                className={`py-2 rounded-lg border-2 transition-all flex flex-col items-center gap-0.5 ${
                                  isSelected 
                                  ? 'border-blue-500 bg-blue-50 scale-105 shadow-md' 
                                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                                }`}
                              >
                                <span className="text-lg">{r.emoji}</span>
                                <span className={`text-[9px] font-bold ${isSelected ? 'text-blue-700' : 'text-gray-400'}`}>
                                  {r.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Navigation within category */}
                        <div className="flex justify-between mt-2">
                          <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => {
                              if (currentIndex > 0) {
                                setCurrentQuestionIndices({
                                  ...currentQuestionIndices,
                                  [cat]: currentIndex - 1
                                });
                              }
                            }}
                            disabled={currentIndex === 0}
                            className="text-xs"
                          >
                            Prev
                          </Button>
                          <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => {
                              if (currentIndex < total - 1) {
                                setCurrentQuestionIndices({
                                  ...currentQuestionIndices,
                                  [cat]: currentIndex + 1
                                });
                              }
                            }}
                            disabled={currentIndex >= total - 1}
                            className="text-xs"
                          >
                            Next
                          </Button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}

                {/* Complete message */}
                {isComplete && !isExpanded && (
                  <div className="p-3 text-center">
                    <p className="text-xs font-medium text-green-700">
                      ✨ Complete! <span className="text-[10px] text-gray-500">(Click to edit)</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall completion indicator and submit */}
        <div className="mt-4 pt-4 border-t border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {categories.map((cat) => {
                  const questionsInCategory = relevantQuestions.filter(q => q.category === cat);
                  const answered = questionsInCategory.filter(q => answers.some(a => a.questionId === q.id)).length;
                  const isComplete = answered === questionsInCategory.length;
                  return (
                    <div 
                      key={cat}
                      className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs ${
                        isComplete ? categoryInfo[cat].color + ' text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isComplete ? '✓' : categoryInfo[cat].icon}
                    </div>
                  );
                })}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">
                  {answers.length} / {relevantQuestions.length} answers
                </p>
                <p className="text-[10px] text-gray-500">Complete all to proceed</p>
              </div>
            </div>
            
            {relevantQuestions.every(q => answers.some(a => a.questionId === q.id)) && (
              <Button 
                onClick={() => onComplete({answers})} 
                className="bg-success text-white flex items-center gap-2"
                size="sm"
              >
                Complete
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssessmentStep;