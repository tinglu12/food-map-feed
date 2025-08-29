"use client";

import VideoPlayer from "@/features/feed/components/VideoPlayer";
import LinkInput from "@/features/link-input/components/LinkInput";
import RestaurantDisplay from "@/features/map/components/RestaurantDisplay";
import MapCaller from "@/features/map/components/LazyMap";
import React from "react";
import { useVideos } from "@/features/feed/hooks/useVideos";
import { ResetButton } from "@/features/feed/components/ResetButton";

const FeedPage = () => {
  const { video, loading } = useVideos();
  console.log("video:", video);
  return (
    <main className="flex flex-col gap-2 justify-center items-center w-screen h-screen overflow-hidden">
      <ResetButton />
      {video && (
        <section className="flex md:flex-row flex-col justify-center items-center gap-2 w-full p-8 flex-1 overflow-hidden">
          {video?.restaurant && <RestaurantDisplay {...video.restaurant} />}

          <MapCaller coordinates={{ latitude: video?.latitude, longitude: video?.longitude }} />
          <VideoPlayer videoId={video.id} />
        </section>
      )}
      {loading && <div>Loading...</div>}
      {!video && <div>No video found</div>}
    </main>
  );
};

export default FeedPage;
