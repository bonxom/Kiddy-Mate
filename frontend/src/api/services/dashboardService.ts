/**
 * Dashboard Aggregation Service
 * Combines multiple API calls to provide complete dashboard data
 */

import axiosClient from '../client/axiosClient';
import { getChild } from './childService';
import { getChildTasks } from './taskService';
import { getLatestAssessment, calculateSkillScores } from './assessmentService';
import { getEmotionData } from './interactionService';
import type { EmotionData } from './interactionService';
import type { ChildTaskWithDetails } from './taskService';

// ==================== TYPES ====================

export interface DashboardResponse {
  child: {
    name: string;
    level: number;
    coins: number;
  };
  tasks_completed: number;
  badges_earned: number;
  completion_rate: number; // Percentage (0-100)
}

export interface StatsCardsData {
  level: string;
  totalCoins: string;
  achievements: string;
  completion: string;
}

export interface CompletionTrendDataPoint {
  name: string;
  completed: number;
  total: number;
  rate: number;
}

export interface CategoryProgressData {
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface ActivityTimelineItem {
  id: string;
  time: string;
  task: string;
  category: string;
  status: string;
  completed: boolean;
  reward: string;
  childName: string;
  childAvatar: string;
}

export interface SkillRadarData {
  skill: string;
  value: number;
  fullMark: number;
}

export interface DashboardData {
  stats: StatsCardsData;
  completionTrend: CompletionTrendDataPoint[];
  categoryProgress: CategoryProgressData[];
  activityTimeline: ActivityTimelineItem[];
  skillRadar: SkillRadarData[];
  emotions: EmotionData[];
}

// ==================== MICRO-ENDPOINTS ====================

/**
 * Get basic dashboard stats (direct API call)
 */
export const getDashboardStats = async (
  childId: string
): Promise<DashboardResponse> => {
  const response = await axiosClient.get<DashboardResponse>(`/dashboard/${childId}`);
  return response.data;
};

/**
 * Get stats cards data (aggregated)
 */
export const getStatsCards = async (childId: string): Promise<StatsCardsData> => {
  try {
    const dashboard = await getDashboardStats(childId);

    return {
      level: dashboard.child.level.toString(),
      totalCoins: dashboard.child.coins.toLocaleString(),
      achievements: dashboard.badges_earned.toString(),
      completion: `${dashboard.completion_rate}%`,
    };
  } catch (error) {
    console.error('Failed to fetch stats cards:', error);
    // Fallback for newly registered children or API errors
    return {
      level: '1',
      totalCoins: '0',
      achievements: '0',
      completion: '0%',
    };
  }
};

/**
 * Get completion trend data (7 days)
 * Groups tasks by date and calculates completion rates
 */
export const getCompletionTrend = async (
  childId: string,
  days: number = 7
): Promise<CompletionTrendDataPoint[]> => {
  try {
    const tasks = await getChildTasks(childId);

  // Get last N days
  const today = new Date();
  const daysData: CompletionTrendDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Format date to match task dates
    const dateStr = date.toISOString().split('T')[0];

    // Filter tasks for this date
    const dayTasks = tasks.filter((task) => {
      const taskDate = task.assigned_at?.split('T')[0];
      return taskDate === dateStr;
    });

    const completed = dayTasks.filter((t) => t.status === 'completed').length;
    const total = dayTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Get day name
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[date.getDay()];

    daysData.push({
      name: dayName,
      completed,
      total,
      rate,
    });
  }

  return daysData;
  } catch (error) {
    console.error('Failed to fetch completion trend:', error);
    // Return empty 7 days for newly registered children
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        name: dayNames[date.getDay()],
        completed: 0,
        total: 0,
        rate: 0,
      };
    });
  }
};

/**
 * Get category progress data from backend API
 * Returns task completion statistics grouped by category
 */
export const getCategoryProgress = async (
  childId: string
): Promise<CategoryProgressData[]> => {
  try {
    const response = await axiosClient.get<CategoryProgressData[]>(
      `/dashboard/${childId}/category-progress`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch category progress:', error);
    // Return empty data for all categories as fallback
    const categories = ['Independence', 'Logic', 'Physical', 'Creativity', 'Social', 'Academic'];
    return categories.map(cat => ({
      name: cat,
      completed: 0,
      total: 0,
      percentage: 0,
    }));
  }
};

/**
 * Get activity timeline (recent tasks)
 */
export const getActivityTimeline = async (
  childId: string,
  limit: number = 10
): Promise<ActivityTimelineItem[]> => {
  try {
    const [tasks, child] = await Promise.all([
      getChildTasks(childId, { limit }), // Backend now supports limit param
      getChild(childId),
    ]);

    // Backend returns tasks sorted by assigned_at descending
    // Format for timeline with real task details
    const activities: ActivityTimelineItem[] = tasks.map((ct) => ({
      id: ct.id,
      time: formatTime(ct.assigned_at),
      task: ct.task?.title || 'Unknown Task',
      category: ct.task?.category || 'Other',
      status: ct.status,
      completed: ct.status === 'completed',
      reward: `+${ct.task?.reward_coins || 0} Coins`,
      childName: child.name,
      childAvatar: child.name.charAt(0).toUpperCase(),
    }));

    return activities;
  } catch (error) {
    console.error('Failed to fetch activity timeline:', error);
    // Return empty array for newly registered children
    return [];
  }
};

/**
 * Get skill radar data from initial_traits (Gemini analysis) or fallback to assessment calculation
 */
export const getSkillRadar = async (
  childId: string
): Promise<SkillRadarData[]> => {
  try {
    // First, try to get from initial_traits (Gemini analysis results)
    const child = await getChild(childId);
    
    if (child.initial_traits?.overall_traits) {
      const traits = child.initial_traits.overall_traits;
      return [
        { skill: 'Independence', value: traits.independence || 50, fullMark: 100 },
        { skill: 'Emotional', value: traits.emotional || 50, fullMark: 100 },
        { skill: 'Discipline', value: traits.discipline || 50, fullMark: 100 },
        { skill: 'Social', value: traits.social || 50, fullMark: 100 },
        { skill: 'Logic', value: traits.logic || 50, fullMark: 100 },
      ];
    }
    
    // Fallback: Calculate from assessment if initial_traits not available
    const assessment = await getLatestAssessment(childId);
    return calculateSkillScores(assessment);
  } catch (error) {
    console.error('Failed to fetch skill radar data:', error);
    // Return default scores if both methods fail
    return [
      { skill: 'Independence', value: 50, fullMark: 100 },
      { skill: 'Emotional', value: 50, fullMark: 100 },
      { skill: 'Discipline', value: 50, fullMark: 100 },
      { skill: 'Social', value: 50, fullMark: 100 },
      { skill: 'Logic', value: 50, fullMark: 100 },
    ];
  }
};

/**
 * Get emotion distribution data
 * Used for Emotion Pie Chart
 */
export const getEmotions = async (childId: string): Promise<EmotionData[]> => {
  try {
    const emotions = await getEmotionData(childId);
    
    // Return empty array if no emotions logged yet (newly registered children)
    if (!emotions || emotions.length === 0) {
      return [];
    }
    
    return emotions;
  } catch (error) {
    console.error('Failed to fetch emotions:', error);
    // Return empty array for newly registered children
    return [];
  }
};

/**
 * Get complete dashboard data (all components)
 * Optimized with parallel API calls
 * Uses Promise.allSettled for graceful degradation - if one API fails, others still work
 */
export const getDashboardData = async (childId: string): Promise<DashboardData> => {
  const results = await Promise.allSettled([
    getStatsCards(childId),
    getCompletionTrend(childId, 7),
    getCategoryProgress(childId),
    getActivityTimeline(childId, 10),
    getSkillRadar(childId),
    getEmotions(childId),
  ]);

  // Extract values with fallbacks for failed promises
  const stats = results[0].status === 'fulfilled' 
    ? results[0].value 
    : { level: '1', totalCoins: '0', achievements: '0', completion: '0%' };
    
  const completionTrend = results[1].status === 'fulfilled' 
    ? results[1].value 
    : [];
    
  const categoryProgress = results[2].status === 'fulfilled' 
    ? results[2].value 
    : [];
    
  const activityTimeline = results[3].status === 'fulfilled' 
    ? results[3].value 
    : [];
    
  const skillRadar = results[4].status === 'fulfilled' 
    ? results[4].value 
    : [];
    
  const emotions = results[5].status === 'fulfilled' 
    ? results[5].value 
    : [];

  // Log any failures for debugging
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const names = ['stats', 'completionTrend', 'categoryProgress', 'activityTimeline', 'skillRadar', 'emotions'];
      console.error(`Failed to fetch ${names[index]}:`, result.reason);
    }
  });

  return {
    stats,
    completionTrend,
    categoryProgress,
    activityTimeline,
    skillRadar,
    emotions,
  };
};

// ==================== HELPERS ====================

/**
 * Format timestamp to time string (HH:MM AM/PM)
 */
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 -> 12

  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
};

/**
 * Analyze emotion report and generate new tasks based on the analysis
 * If reportId is provided, uses that specific report. Otherwise, uses the most recent report.
 * Generates up to 20 tasks based on emotional patterns and insights.
 */
export const analyzeEmotionReportAndGenerateTasks = async (
  childId: string,
  reportId?: string
): Promise<ChildTaskWithDetails[]> => {
  const response = await axiosClient.post<ChildTaskWithDetails[]>(
    `/dashboard/${childId}/analyze-emotion-report`,
    { report_id: reportId || null }
  );
  return response.data;
};

export default {
  getDashboardStats,
  getStatsCards,
  getCompletionTrend,
  getCategoryProgress,
  getActivityTimeline,
  getSkillRadar,
  getEmotions,
  getDashboardData,
  analyzeEmotionReportAndGenerateTasks,
};
