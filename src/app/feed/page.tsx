"use client";

import RestaurantDisplay from "@/features/map/components/RestaurantDisplay";
import MapCaller from "@/features/map/components/LazyMap";
import React from "react";
import { useVideos } from "@/features/feed/hooks/useVideos";
import { ResetButton } from "@/features/feed/components/ResetButton";
import VideoFeed from "@/features/feed/components/VideoFeed";
import NextButton from "@/features/feed/components/NextButton";
import FavoriteButton from "@/features/feed/components/FavoriteButton";

const FeedPage = () => {
  const { video, loading, loadVideoById } = useVideos();
  return (
    <main className="flex flex-col gap-2 justify-center items-center w-full h-screen overflow-hidden">
      <div className="flex gap-2">
        <ResetButton />
        {video && <NextButton />}
        {video && <FavoriteButton videoId={video.id} isFavorited={video.isFavorited} />}
      </div>

      {video && (
        <section className="flex md:flex-row flex-col flex-1 min-h-0 justify-between items-center gap-2 w-full overflow-hidden relative p-4">
          {video?.restaurant && <RestaurantDisplay {...video.restaurant} />}
          <VideoFeed videoId={video.id} />

          <MapCaller
            key={video?.id}
            coordinates={{ latitude: video?.latitude, longitude: video?.longitude }}
            videoId={video?.id}
            onVideoChange={loadVideoById}
            name={video.restaurant?.name}
          />
        </section>
      )}
      {loading && <div>Loading...</div>}
      {!video && <div>No video found</div>}
    </main>
  );
};

export default FeedPage;
