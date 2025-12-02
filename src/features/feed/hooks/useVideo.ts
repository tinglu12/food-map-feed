import { useQuery } from "@tanstack/react-query";
import { getVideo } from "../api/videosAPI";

export const useVideo = (videoId: string) => {
  return useQuery({
    queryKey: ["video", videoId],
    queryFn: () => getVideo(videoId),
  });
};
