import { useQuery } from "@tanstack/react-query";
import { getVideoById } from "../api/videosAPI";

export const useVideo = (videoId: string) => {
  return useQuery({
    queryKey: ["video", videoId],
    queryFn: () => getVideoById(videoId),
  });
};
