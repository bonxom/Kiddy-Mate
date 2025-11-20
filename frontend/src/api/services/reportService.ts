/**
 * Report API Service
 * Handles weekly/periodic child development reports
 */

import axiosClient from '../client/axiosClient';

export interface Report {
  id: string;
  period_start: string;
  period_end: string;
  generated_at: string;
  summary_text: string;
  insights: Record<string, any>;
  suggestions: Record<string, any>;
}

/**
 * Get all reports for a child
 */
export const getReports = async (childId: string): Promise<Report[]> => {
  const response = await axiosClient.get<Report[]>(`/reports/${childId}`);
  return response.data;
};

/**
 * Get single report by ID
 */
export const getReport = async (
  childId: string,
  reportId: string
): Promise<Report> => {
  const response = await axiosClient.get<Report>(`/reports/${childId}/${reportId}`);
  return response.data;
};

/**
 * Get latest report for a child
 */
export const getLatestReport = async (childId: string): Promise<Report | null> => {
  const reports = await getReports(childId);
  return reports.length > 0 ? reports[0] : null;
};

export default {
  getReports,
  getReport,
  getLatestReport,
};
