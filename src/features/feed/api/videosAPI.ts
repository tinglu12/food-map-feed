import { VideoData } from "../type/video";
import apiClient from "@/utils/axios";

/**
 * Check if video exists in database, return it if found
 */
export const getVideoById = async (videoId: string): Promise<VideoData | null> => {
  const response = await apiClient.get<VideoData>(`/api/videos/${videoId}`);
  return response.data || null;
};

export const fetchAndSaveVideoById = async (videoId: string): Promise<VideoData | null> => {
  const response = await apiClient.post<VideoData>(`/api/videos/${videoId}`);
  return response.data || null;
};
