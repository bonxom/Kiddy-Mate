/**
 * Interaction API Service
 * Handles child-avatar interaction and emotion tracking
 */

import axiosClient from '../client/axiosClient';

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

/**
 * Send chat message to avatar
 */
export const sendChat = async (
  childId: string,
  userInput: string
): Promise<ChatResponse> => {
  const response = await axiosClient.post<ChatResponse>(
    `/children/${childId}/interact/chat`,
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
    `/children/${childId}/interact/logs`
  );
  return response.data.emotions;
};

export default {
  sendChat,
  getEmotionData,
};
