import React from "react";
import VideoPlayer from "./VideoPlayer";
import { useVideos } from "../hooks/useFeed";
import { Button } from "@/components/ui/button";
const VideoFeed = ({ videoId }: { videoId: string }) => {
  return <VideoPlayer videoId={videoId} />;
};

export default VideoFeed;
