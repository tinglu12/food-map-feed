"use client";
import {
  useFavoriteVideo,
  useLoadVideoById,
  useResetHistory,
  useUnfavoriteVideo,
  useUnwatchedVideo,
} from "../lib/useVideoQueries";

export const useVideos = () => {
  const { data: video, isLoading, error, refetch } = useUnwatchedVideo();
  const resetHistoryMutation = useResetHistory();
  const favoriteVideoMutation = useFavoriteVideo();
  const unfavoriteVideoMutation = useUnfavoriteVideo();
  const loadVideoByIdMutation = useLoadVideoById();
  const getNextVideo = async () => {
    if (video) {
      await refetch();
    }
  };

  const resetHistory = async () => {
    await resetHistoryMutation.mutateAsync();
  };

  const favoriteVideo = async (videoId: string) => {
    await favoriteVideoMutation.mutateAsync(videoId);
  };

  const unfavoriteVideo = async (videoId: string) => {
    await unfavoriteVideoMutation.mutateAsync(videoId);
  };

  const loadVideoById = async (videoId: string) => {
    console.log("Loading video by ID:", videoId);
    const loadedVideo = await loadVideoByIdMutation.mutateAsync(videoId);
    // The mutation's onSuccess will update the cache,
    // which will automatically update the video from useUnwatchedVideo()
    return loadedVideo;
  };

  return {
    video: video || null,
    loading: isLoading || loadVideoByIdMutation.isPending,
    error,
    getNextVideo,
    resetHistory,
    isResetting: resetHistoryMutation.isPending,
    favoriteVideo,
    isFavoriting: favoriteVideoMutation.isPending,
    unfavoriteVideo,
    isUnfavoriting: unfavoriteVideoMutation.isPending,
    loadVideoById,
    isLoading: isLoading || loadVideoByIdMutation.isPending,
  };
};
