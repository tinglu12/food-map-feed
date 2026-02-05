"use client";

import { useEffect, useState } from "react";
import VideoContentDisplay from "@/components/VideoContentDisplay";
import { getVideoById } from "@/features/feed/api/videosAPI";
import LinkInput from "@/features/link-input/components/LinkInput";
import { VideoData } from "@/features/feed/type/video";
import { useParams } from "next/navigation";
import { useVideo } from "@/features/feed/hooks/useVideo";

const VideoPage = () => {
  const params = useParams();
  const video_id = params.video_id as string;
  const { data: video, isLoading, error } = useVideo(video_id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!video_id || error || !video) {
    return <div>Video not found</div>;
  }

  return (
    <main className="z-0 flex flex-col gap-2 justify-center items-center w-full h-screen overflow-hidden">
      {video && <VideoContentDisplay video={video} />}
    </main>
  );
};

export default VideoPage;
