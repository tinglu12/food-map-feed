"use client";

import RestaurantDisplay from "@/features/map/components/RestaurantDisplay";
import MapCaller from "@/features/map/components/LazyMap";
import React from "react";
import { useVideos } from "@/features/feed/hooks/useFeed";
import { ResetButton } from "@/features/feed/components/ResetButton";
import VideoFeed from "@/features/feed/components/VideoFeed";
import NextButton from "@/features/feed/components/NextButton";
import FavoriteButton from "@/features/feed/components/FavoriteButton";
import VideoContentDisplay from "@/components/VideoContentDisplay";

const FeedPage = () => {
  const { video, loading, loadVideoById } = useVideos();
  return (
    <main className="flex flex-col gap-2 justify-center items-center w-full h-screen overflow-hidden">
      <div className="flex gap-2">
        <ResetButton />
        {video && <NextButton />}
        {video && <FavoriteButton videoId={video.id} isFavorited={video.isFavorited} />}
      </div>

      {video && <VideoContentDisplay video={video} />}
      {loading && <div>Loading...</div>}
      {!video && <div>No video found</div>}
    </main>
  );
};

export default FeedPage;
