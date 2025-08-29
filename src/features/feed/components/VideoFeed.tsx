import React from "react";
import VideoPlayer from "./VideoPlayer";
import { useVideos } from "../hooks/useVideos";
import { Button } from "@/components/ui/button";
const VideoFeed = ({ videoId }: { videoId: string }) => {
  const { getNextVideo } = useVideos();
  const handleRefetch = async () => {
    await getNextVideo();
  };
  return (
    <div className="flex flex-col gap-2 md:w-1/3 w-full h-full justify-center items-center">
      <VideoPlayer videoId={videoId} />
      <Button onClick={handleRefetch}>Refetch</Button>
    </div>
  );
};

export default VideoFeed;
