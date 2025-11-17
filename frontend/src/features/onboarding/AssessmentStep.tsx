import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Brain, Heart, Users } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { assessmentQuestions, ratingLabels } from '../../data/assessmentQuestions';
import type { ChildAssessment, AssessmentAnswer, AssessmentCategory } from '../../types/auth.types';

interface AssessmentStepProps {
  childNumber: number;
  totalChildren: number;
  childName: string;
  initialData: ChildAssessment;
  onComplete: (data: ChildAssessment) => void;
  onBack: () => void;
}

const AssessmentStep = ({ childNumber, totalChildren, childName, initialData, onComplete, onBack }: AssessmentStepProps) => {
  const [answers, setAnswers] = useState<AssessmentAnswer[]>(initialData.answers || []);
  const [activeCategory, setActiveCategory] = useState<AssessmentCategory>('discipline');

  const categories: Array<{ id: AssessmentCategory; label: string; icon: typeof Brain; color: string }> = [
    { id: 'discipline', label: 'Kỷ luật & Tự lập', icon: CheckCircle2, color: 'from-blue-500 to-cyan-500' },
    { id: 'emotional', label: 'Trí tuệ Cảm xúc', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { id: 'social', label: 'Kỹ năng Xã hội', icon: Users, color: 'from-purple-500 to-indigo-500' },
  ];

  const questionsForCategory = assessmentQuestions.filter(q => q.category === activeCategory);
  
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
    const categoryQuestions = assessmentQuestions.filter(q => q.category === category);
    const answeredCount = categoryQuestions.filter(q => 
      answers.some(a => a.questionId === q.id)
    ).length;
    return (answeredCount / categoryQuestions.length) * 100;
  };

  const allQuestionsAnswered = assessmentQuestions.every(q => 
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
    } else if (allQuestionsAnswered) {
      handleSubmit();
    }
  };

  const canProceedToNext = questionsForCategory.every(q => 
    answers.some(a => a.questionId === q.id)
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="primary" className="mb-4">
            Child {childNumber} of {totalChildren} - {childName}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assessment Questionnaire 📋
          </h1>
          <p className="text-gray-600">
            Help us understand {childName}'s current abilities
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="text-sm font-medium text-gray-400">Parent Info</span>
            </div>
            <div className="w-12 h-1 bg-green-500 rounded-full" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="text-sm font-medium text-gray-400">Child Info</span>
            </div>
            <div className="w-12 h-1 bg-gradient-primary rounded-full" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm font-medium text-gray-900">Assessment</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const progress = getCategoryProgress(category.id);
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-primary-500 bg-primary-50 shadow-medium'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${category.color} flex items-center justify-center shadow-medium`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                      {category.label}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-linear-to-r ${category.color} transition-all duration-300`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(progress)}% complete
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Questions Card */}
        <Card padding="lg">
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
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
                      <Badge variant="default" className="shrink-0">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {question.question}
                        </h3>
                        {question.description && (
                          <p className="text-sm text-gray-600">
                            {question.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating Buttons */}
                  <div className="grid grid-cols-5 gap-2">
                    {ratingLabels.map((rating) => {
                      const isSelected = currentAnswer === rating.value;
                      
                      return (
                        <button
                          key={rating.value}
                          type="button"
                          onClick={() => setAnswerForQuestion(question.id, rating.value as 1 | 2 | 3 | 4 | 5)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 shadow-medium scale-105'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-2xl">{rating.emoji}</span>
                          <span className={`text-xs font-medium text-center ${isSelected ? 'text-primary-700' : 'text-gray-600'}`}>
                            {rating.label}
                          </span>
                          <span className={`text-xs font-bold ${isSelected ? rating.color : 'text-gray-400'}`}>
                            {rating.value}
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
          <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              icon={<ArrowLeft className="w-5 h-5" />}
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
              >
                {childNumber < totalChildren ? 'Next Child' : 'Complete Onboarding'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Progress Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Overall Progress:</span> {answers.length} / {assessmentQuestions.length} questions answered 
            ({Math.round((answers.length / assessmentQuestions.length) * 100)}%)
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentStep;
