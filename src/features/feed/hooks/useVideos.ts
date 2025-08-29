"use client";
import { useUnwatchedVideo } from "../lib/useVideoQueries";

export const useVideos = () => {
  const { data: video, isLoading, error } = useUnwatchedVideo();

  return {
    video: video || null,
    loading: isLoading,
    error,
  };
};
