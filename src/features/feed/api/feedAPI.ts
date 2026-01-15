import { createClient } from "@/utils/supabase/client";
import { returnedVideo, videoData } from "../type/video";
import apiClient from "@/utils/axios";

export const getFeed = async () => {
  const response = await apiClient.get<videoData>("/api/feed");
  return response.data;
};

export const resetHistory = async () => {
  await apiClient.post("/api/feed/reset");
};

export const favoriteVideo = async (videoId: string) => {
  const response = await apiClient.post(`/api/feed/${videoId}/favorite`);
  return response.data;
};

export const unfavoriteVideo = async (videoId: string) => {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  const { error } = await supabase.from("video_favorites").delete().eq("video_id", videoId);
  return error;
};
