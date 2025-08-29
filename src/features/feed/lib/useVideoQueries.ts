import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeed, resetHistory } from "../api/feedAPI";

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
