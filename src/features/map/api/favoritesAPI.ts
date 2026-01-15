
import apiClient from "@/utils/axios";

export const getFavorites = async () => {
  const response = await apiClient.get("/api/videos/favorites");
  return response.data;
};
