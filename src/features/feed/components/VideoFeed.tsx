import React from "react";
import VideoPlayer from "./VideoPlayer";
import { useVideos } from "../hooks/useFeed";
import { Button } from "@/components/ui/button";
const VideoFeed = ({ videoId }: { videoId: string }) => {
  return (
    <div className="flex flex-col gap-2 md:w-1/4 w-full h-full justify-center items-center z-100">
      <VideoPlayer videoId={videoId} />
    </div>
  );
};

export default VideoFeed;
