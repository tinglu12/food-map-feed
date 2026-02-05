import { ReturnedVideo, VideoData } from "../type/video";
import apiClient from "@/utils/axios";

export const getFeed = async () => {
  const response = await apiClient.get<VideoData>("/api/feed");
  return response.data;
};

export const resetHistory = async () => {
  await apiClient.post("/api/feed/reset");
};

export const favoriteVideo = async (videoId: string) => {
  const response = await apiClient.post(`/api/videos/${videoId}/favorite`);
  return response.data;
};

export const unfavoriteVideo = async (videoId: string) => {
  const response = await apiClient.post(`/api/videos/${videoId}/unfavorite`);
  return response.data;
};
