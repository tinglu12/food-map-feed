import { useFavoritesVideosQuery } from "../lib/useFavoriteQueries";

export const useFavorites = () => {
  const { data, error } = useFavoritesVideosQuery();
  return { data, error };
};
