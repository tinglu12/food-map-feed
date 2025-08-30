import { useQuery } from "@tanstack/react-query";
import { getFavorites } from "../api/favoritesAPI";

export const favoritesKeys = {
  all: ["favorites"] as const,
};

export const useFavoritesVideosQuery = () => {
  return useQuery({
    queryKey: favoritesKeys.all,
    queryFn: getFavorites,
  });
};
