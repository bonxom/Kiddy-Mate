/**
 * Assessment API Service
 * Handles child development assessment operations
 */

import axiosClient from '../client/axiosClient';

export interface AssessmentAnswers {
  [key: string]: number | string | null; // Backend returns string, frontend converts to number
}

export interface ChildAssessment {
  id: string;
  child_id: string;
  parent_id: string;
  discipline_autonomy: AssessmentAnswers;
  emotional_intelligence: AssessmentAnswers;
  social_interaction: AssessmentAnswers;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAssessmentRequest {
  discipline_autonomy: AssessmentAnswers;
  emotional_intelligence: AssessmentAnswers;
  social_interaction: AssessmentAnswers;
}

export interface UpdateAssessmentRequest {
  discipline_autonomy?: AssessmentAnswers;
  emotional_intelligence?: AssessmentAnswers;
  social_interaction?: AssessmentAnswers;
}

/**
 * Get all assessments for a child
 */
export const getAssessments = async (
  childId: string
): Promise<ChildAssessment[]> => {
  const response = await axiosClient.get<ChildAssessment[]>(
    `/children/${childId}/assessments`
  );
  return response.data;
};

/**
 * Get latest assessment for a child
 */
export const getLatestAssessment = async (
  childId: string
): Promise<ChildAssessment | null> => {
  const assessments = await getAssessments(childId);
  return assessments.length > 0 ? assessments[0] : null;
};

/**
 * Get single assessment by ID
 */
export const getAssessment = async (
  childId: string,
  assessmentId: string
): Promise<ChildAssessment> => {
  const response = await axiosClient.get<ChildAssessment>(
    `/children/${childId}/assessments/${assessmentId}`
  );
  return response.data;
};

/**
 * Create new assessment
 */
export const createAssessment = async (
  childId: string,
  data: CreateAssessmentRequest
): Promise<ChildAssessment> => {
  const response = await axiosClient.post<ChildAssessment>(
    `/children/${childId}/assessments`,
    data
  );
  return response.data;
};

/**
 * Update existing assessment
 */
export const updateAssessment = async (
  childId: string,
  assessmentId: string,
  data: UpdateAssessmentRequest
): Promise<ChildAssessment> => {
  const response = await axiosClient.put<ChildAssessment>(
    `/children/${childId}/assessments/${assessmentId}`,
    data
  );
  return response.data;
};

/**
 * Calculate skill scores from assessment answers
 * Each dimension score = average of answers (1-5) converted to 20-100 scale
 * Fallback: 50 (baseline for newly registered children)
 */
export const calculateSkillScores = (
  assessment: ChildAssessment | null
): { skill: string; value: number; fullMark: number }[] => {
  // Fallback: Baseline scores for new children (50 = neutral/developing)
  if (!assessment) {
    return [
      { skill: 'Independence', value: 50, fullMark: 100 },
      { skill: 'Emotional', value: 50, fullMark: 100 },
      { skill: 'Discipline', value: 50, fullMark: 100 },
      { skill: 'Social', value: 50, fullMark: 100 },
      { skill: 'Logic', value: 50, fullMark: 100 },
    ];
  }

  // Calculate average for each dimension (answers are 1-5, convert to 20-100)
  const disciplineScore = calculateAverageScore(assessment.discipline_autonomy);
  const emotionalScore = calculateAverageScore(assessment.emotional_intelligence);
  const socialScore = calculateAverageScore(assessment.social_interaction);

  return [
    { skill: 'Independence', value: disciplineScore, fullMark: 100 },
    { skill: 'Emotional', value: emotionalScore, fullMark: 100 },
    { skill: 'Discipline', value: disciplineScore, fullMark: 100 },
    { skill: 'Social', value: socialScore, fullMark: 100 },
    { skill: 'Logic', value: 50, fullMark: 100 }, // Baseline until task completion data available
  ];
};

/**
 * Helper: Calculate average score from answers (1-5 scale to 20-100)
 * Ensures minimum score of 20 (prevents negative/zero values in charts)
 */
const calculateAverageScore = (answers: AssessmentAnswers): number => {
  const values = Object.values(answers).filter(v => v !== null && v !== undefined);
  if (values.length === 0) return 50; // Baseline for empty/null answers

  // Convert all values to numbers (backend may return strings)
  const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
  if (numericValues.length === 0) return 50;

  const sum = numericValues.reduce((acc, val) => acc + val, 0);
  const average = sum / numericValues.length;

  // Convert 1-5 scale to 20-100 (1→20, 3→60, 5→100)
  return Math.round(20 + ((average - 1) / 4) * 80);
};

export default {
  getAssessments,
  getLatestAssessment,
  getAssessment,
  createAssessment,
  updateAssessment,
  calculateSkillScores,
};
