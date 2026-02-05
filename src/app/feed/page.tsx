"use client";

import RestaurantDisplay from "@/features/map/components/RestaurantDisplay";
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
      {video && <VideoContentDisplay video={video} onVideoChange={loadVideoById} />}
      {loading && <div>Loading...</div>}
      {!video && (
        <div className="flex flex-col items-center justify-center gap-2">
          No video found
          <ResetButton />
        </div>
      )}
    </main>
  );
};

export default FeedPage;
