/**
 * Category Configuration Constants
 * Shared across all dashboard components to maintain consistency
 */

import { Target, Brain, Dumbbell, Palette, Users, BookOpen } from 'lucide-react';
import type { ElementType } from 'react';

export interface CategoryConfig {
  name: string;
  color: string;
  bgColor: string;
  icon: ElementType;
}

/**
 * Category color mapping
 */
export const CATEGORY_COLORS: Record<string, { color: string; bgColor: string }> = {
  Independence: { color: '#3b82f6', bgColor: 'bg-blue-50' },
  Logic: { color: '#8b5cf6', bgColor: 'bg-purple-50' },
  Physical: { color: '#10b981', bgColor: 'bg-green-50' },
  Creativity: { color: '#ec4899', bgColor: 'bg-pink-50' },
  Social: { color: '#f59e0b', bgColor: 'bg-amber-50' },
  Academic: { color: '#6366f1', bgColor: 'bg-indigo-50' },
  // Legacy mappings
  IQ: { color: '#8b5cf6', bgColor: 'bg-purple-50' },
  EQ: { color: '#f59e0b', bgColor: 'bg-amber-50' },
};

/**
 * Category icon mapping
 */
export const CATEGORY_ICONS: Record<string, ElementType> = {
  Independence: Target,
  Logic: Brain,
  Physical: Dumbbell,
  Creativity: Palette,
  Social: Users,
  Academic: BookOpen,
  IQ: Brain,
  EQ: Users,
};

/**
 * Get category configuration
 */
export const getCategoryConfig = (category: string): CategoryConfig => {
  return {
    name: category,
    color: CATEGORY_COLORS[category]?.color || '#6b7280',
    bgColor: CATEGORY_COLORS[category]?.bgColor || 'bg-gray-50',
    icon: CATEGORY_ICONS[category] || Target,
  };
};

/**
 * Get category icon element type
 */
export const getCategoryIconType = (category: string): ElementType => {
  return CATEGORY_ICONS[category] || Target;
};

/**
 * Get category color classes for text/bg
 */
export const getCategoryColorClasses = (category: string): string => {
  const colorMap: Record<string, string> = {
    Independence: 'text-blue-600 bg-blue-50',
    Logic: 'text-purple-600 bg-purple-50',
    Physical: 'text-green-600 bg-green-50',
    Creativity: 'text-pink-600 bg-pink-50',
    Social: 'text-orange-600 bg-orange-50',
    Academic: 'text-indigo-600 bg-indigo-50',
    IQ: 'text-purple-600 bg-purple-50',
    EQ: 'text-orange-600 bg-orange-50',
  };
  return colorMap[category] || 'text-gray-600 bg-gray-50';
};

/**
 * Normalize category name (backend compatibility)
 */
export const normalizeCategoryName = (category: string): string => {
  const mapping: Record<string, string> = {
    IQ: 'Logic',
    EQ: 'Social',
  };
  return mapping[category] || category;
};

/**
 * Emotion colors for pie chart
 */
export const EMOTION_COLORS = ['#34d399', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa'];

/**
 * Skill development colors
 */
export const SKILL_COLORS: Record<string, { text: string; bg: string }> = {
  Independence: { text: 'text-blue-600', bg: 'bg-blue-50' },
  Emotional: { text: 'text-pink-600', bg: 'bg-pink-50' },
  Discipline: { text: 'text-purple-600', bg: 'bg-purple-50' },
  Social: { text: 'text-orange-600', bg: 'bg-orange-50' },
  Logic: { text: 'text-green-600', bg: 'bg-green-50' },
};

/**
 * Skill development icons
 */
export const SKILL_ICONS: Record<string, ElementType> = {
  Independence: Target,
  Emotional: Users, // You can import Heart from lucide-react if needed
  Discipline: Target, // You can import Award from lucide-react if needed
  Social: Users,
  Logic: Brain,
};
