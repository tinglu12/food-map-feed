import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeed, resetHistory, favoriteVideo, unfavoriteVideo } from "../api/feedAPI";

export const videoKeys = {
  all: ["videos"] as const,
  unwatched: () => [...videoKeys.all, "unwatched"] as const,
  watched: () => [...videoKeys.all, "watched"] as const,
  favorites: () => [...videoKeys.all, "favorites"] as const,
};

export const useUnwatchedVideo = () => {
  return useQuery({
    queryKey: videoKeys.unwatched(),
    queryFn: getFeed,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useResetHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.unwatched() });
    },
    onError: (error) => {
      console.error("Error resetting history:", error);
    },
  });
};

export const useFavoriteVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: favoriteVideo,
    onMutate: async (videoId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: videoKeys.unwatched() });

      // Snapshot the previous value
      const previousVideo = queryClient.getQueryData(videoKeys.unwatched());

      // Optimistically update the cache
      queryClient.setQueryData(videoKeys.unwatched(), (old: any) => {
        console.log("Optimistic update - old:", old, "videoId:", videoId);
        if (old && old.id === videoId) {
          console.log("Updating cache for video:", videoId);
          return { ...old, isFavorited: true };
        }
        console.log("No match found for video:", videoId);
        return old;
      });

      return { previousVideo };
    },
    onError: (err, videoId, context) => {
      // Rollback on error
      if (context?.previousVideo) {
        queryClient.setQueryData(videoKeys.unwatched(), context.previousVideo);
      }
      console.error("Error favoriting video:", err);
    },
    onSettled: () => {
      // No need to refetch since we're using optimistic updates
      // The cache is already updated correctly
    },
  });
};

export const useUnfavoriteVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unfavoriteVideo,
    onMutate: async (videoId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: videoKeys.unwatched() });

      // Snapshot the previous value
      const previousVideo = queryClient.getQueryData(videoKeys.unwatched());

      // Optimistically update the cache
      queryClient.setQueryData(videoKeys.unwatched(), (old: any) => {
        console.log("Optimistic update (unfavorite) - old:", old, "videoId:", videoId);
        if (old && old.id === videoId) {
          console.log("Updating cache for video (unfavorite):", videoId);
          return { ...old, isFavorited: false };
        }
        console.log("No match found for video (unfavorite):", videoId);
        return old;
      });

      return { previousVideo };
    },
    onError: (err, videoId, context) => {
      // Rollback on error
      if (context?.previousVideo) {
        queryClient.setQueryData(videoKeys.unwatched(), context.previousVideo);
      }
      console.error("Error unfavoriting video:", err);
    },
    onSettled: () => {
      // No need to refetch since we're using optimistic updates
      // The cache is already updated correctly
    },
  });
};
