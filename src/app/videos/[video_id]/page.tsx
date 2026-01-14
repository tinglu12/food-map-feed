"use client";

import { useEffect, useState } from "react";
import VideoContentDisplay from "@/components/VideoContentDisplay";
import { getVideoById } from "@/features/feed/api/videosAPI";
import LinkInput from "@/features/link-input/components/LinkInput";
import { videoData } from "@/features/feed/type/video";
import { useParams } from "next/navigation";

const VideoPage = () => {
  const params = useParams();
  const video_id = params.video_id as string;
  const [video, setVideo] = useState<videoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        console.log("Video ID:", video_id);
        if (!video_id) {
          setError(true);
          setLoading(false);
          return;
        }
        const videoData = await getVideoById(video_id);
        if (!videoData) {
          setError(true);
        } else {
          setVideo(videoData);
        }
      } catch (err) {
        console.error("Error fetching video:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [video_id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!video_id || error || !video) {
    return <div>Video not found</div>;
  }

  return (
    <main className="flex flex-col gap-2 justify-center items-center w-full h-screen overflow-hidden">
      <section className="flex justify-center items-center w-full p-4">
        <LinkInput />
      </section>
      {video && <VideoContentDisplay video={video} />}
    </main>
  );
};

export default VideoPage;
