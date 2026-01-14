import { createClient } from "@/utils/supabase/server";
import { videoData } from "../type/video";
import apiClient from "@/utils/axios";

/**
 * Check if video exists in database, return it if found
 */
export const getVideoById = async (videoId: string): Promise<videoData | null> => {
  const response = await apiClient.get<videoData>(`/api/videos/${videoId}`);
  console.log("Video data:", response.data);
  return response.data || null;
};

export const fetchAndSaveVideoById = async (videoId: string): Promise<videoData | null> => {
  const response = await apiClient.post<videoData>(`/api/videos/${videoId}`);
  return response.data || null;
};
