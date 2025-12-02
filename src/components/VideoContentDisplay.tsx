"use client";

import { videoData } from "@/features/feed/type/video";
import RestaurantDisplay from "@/features/map/components/RestaurantDisplay";
import React from "react";
import MapCaller from "@/features/map/components/LazyMap";
import VideoPlayer from "@/features/feed/components/VideoPlayer";
import { useRouter } from "next/navigation";
import VideoFeed from "@/features/feed/components/VideoFeed";

const VideoContentDisplay = ({ video }: { video: videoData }) => {
  const router = useRouter();

  const handleVideoChange = (videoId: string) => {
    router.push(`/videos/${videoId}`);
  };

  return (
    <section className="flex md:flex-row flex-col flex-1 min-h-0 justify-between items-center gap-2 w-full overflow-hidden relative p-4">
      {video?.restaurant && <RestaurantDisplay {...video.restaurant} />}
      <VideoFeed videoId={video.id} />

      <MapCaller
        key={video?.id}
        coordinates={{ latitude: video?.latitude, longitude: video?.longitude }}
        videoId={video?.id}
        onVideoChange={handleVideoChange}
        name={video.restaurant?.name}
      />
    </section>
  );
};

export default VideoContentDisplay;
