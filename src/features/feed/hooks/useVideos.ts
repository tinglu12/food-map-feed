"use client";
import { useResetHistory, useUnwatchedVideo } from "../lib/useVideoQueries";

export const useVideos = () => {
  const { data: video, isLoading, error, refetch } = useUnwatchedVideo();
  const resetHistoryMutation = useResetHistory();

  const getNextVideo = async () => {
    if (video) {
      await refetch();
    }
  };

  const resetHistory = async () => {
    await resetHistoryMutation.mutateAsync();
  };

  return {
    video: video || null,
    loading: isLoading,
    error,
    getNextVideo,
    resetHistory,
    isResetting: resetHistoryMutation.isPending,
  };
};
