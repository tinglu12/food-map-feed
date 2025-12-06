"use client";

import { videoData } from "@/features/feed/type/video";
import RestaurantDisplay from "@/features/map/components/RestaurantDisplay";
import React from "react";
import MapCaller from "@/features/map/components/LazyMap";
import { loadVideoById } from "@/features/feed/api/feedAPI";
import VideoFeed from "@/features/feed/components/VideoFeed";
const VideoContentDisplay = ({
  video,
  onVideoChange,
}: {
  video: videoData;
  onVideoChange?: (videoId: string) => void;
}) => {
  console.log("Video:", video);
  return (
    <section className="flex md:flex-row flex-col flex-1 min-h-0 justify-between items-center gap-2 w-full overflow-hidden relative p-4">
      {video?.restaurant && <RestaurantDisplay {...video.restaurant} />}
      <VideoFeed videoId={video.id} />

      <MapCaller
        key={video?.id}
        coordinates={{ latitude: video?.latitude, longitude: video?.longitude }}
        videoId={video?.id}
        onVideoChange={onVideoChange}
        name={video.restaurant?.name}
      />
    </section>
  );
};

export default VideoContentDisplay;
