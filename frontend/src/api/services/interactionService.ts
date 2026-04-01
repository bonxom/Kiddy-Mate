/**
 * Interaction API Service
 * Handles child-avatar interaction and emotion tracking
 */

import axiosClient from '../client/axiosClient';
import { parentApi } from '../parentApi';

export interface EmotionData {
  name: string;
  value: number;
}

export interface InteractionLogsResponse {
  emotions: EmotionData[];
}

export interface ChatRequest {
  user_input: string;
}

export interface ChatResponse {
  message: string;
  avatar_response: string;
}

export interface ChatHistoryItem {
  id: string;
  timestamp: string;
  user_input: string;
  avatar_response: string;
  detected_emotion: string;
}

/**
 * Send chat message to avatar
 */
export const sendChat = async (
  childId: string,
  userInput: string
): Promise<ChatResponse> => {
  const response = await axiosClient.post<ChatResponse>(
    parentApi.interactions.chat(childId),
    { user_input: userInput }
  );
  return response.data;
};

/**
 * Get interaction logs with emotion distribution
 * Used for Dashboard Emotion Pie Chart
 */
export const getEmotionData = async (
  childId: string
): Promise<EmotionData[]> => {
  const response = await axiosClient.get<InteractionLogsResponse>(
    parentApi.interactions.logs(childId)
  );
  return response.data.emotions;
};

/**
 * Get full chat history (interaction logs) for a child
 * Returns list of conversations with user input, avatar response, timestamp, and emotion
 */
export const getChatHistory = async (
  childId: string,
  limit: number = 20
): Promise<ChatHistoryItem[]> => {
  const response = await axiosClient.get<ChatHistoryItem[]>(
    parentApi.interactions.history(childId),
    { params: { limit } }
  );
  return response.data;
};

export default {
  sendChat,
  getEmotionData,
  getChatHistory,
};
