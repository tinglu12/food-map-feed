"use client";

import { VideoData } from "@/features/feed/type/video";
import RestaurantDisplay from "@/features/map/components/RestaurantDisplay";
import React from "react";
import VideoFeed from "@/features/feed/components/VideoFeed";
import { RestaurantData } from "@/types/restaurant";
import MapComponent from "@/features/map/components/MapComponent";
const VideoContentDisplay = ({
  video,
  onVideoChange,
}: {
  video: VideoData;
  onVideoChange?: (videoId: string) => void;
}) => {
  return (
    <section className="z-0 flex md:flex-row flex-col flex-1 min-h-0 justify-between items-center gap-2 w-full overflow-hidden relative p-4">
      {video?.restaurants &&
        video?.restaurants.map((restaurant: RestaurantData) => (
          <RestaurantDisplay key={restaurant.name} {...restaurant} />
        ))}
      <VideoFeed videoId={video.id} />

      <MapComponent
        key={video?.id}
        coordinates={{ latitude: video?.latitude, longitude: video?.longitude }}
        videoId={video?.id}
        onVideoChange={onVideoChange}
        name={video.restaurants?.[0].name}
      />
    </section>
  );
};

export default VideoContentDisplay;
