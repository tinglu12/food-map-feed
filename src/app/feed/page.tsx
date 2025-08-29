"use client";

import VideoPlayer from "@/features/feed/components/VideoPlayer";
import LinkInput from "@/features/link-input/components/LinkInput";
import RestaurantDisplay from "@/features/map/components/RestaurantDisplay";
import MapCaller from "@/features/map/components/LazyMap";
import React from "react";
import { useVideos } from "@/features/feed/hooks/useVideos";

const FeedPage = () => {
  const { video, loading } = useVideos();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!video) {
    return <div>No video found</div>;
  }
  return (
    <main className="flex flex-col gap-2 justify-center items-center w-screen h-screen overflow-hidden">
      <section className="flex md:flex-row flex-col justify-center items-center gap-2 w-full p-8 flex-1 overflow-hidden">
        {video?.restaurant && <RestaurantDisplay {...video.restaurant} />}

        <MapCaller coordinates={{ latitude: video.latitude, longitude: video.longitude }} />
        <VideoPlayer videoId={video.id} />
      </section>
    </main>
  );
};

export default FeedPage;
