import { getVideo } from "@/features/feed/api/videosApi";
import VideoPlayer from "@/features/feed/components/VideoPlayer";
import LinkInput from "@/features/link-input/components/LinkInput";
import React from "react";

const VideoPage = async ({ params }: { params: { video_id: string } }) => {
  const video_id = await params.video_id;
  const video = await getVideo(video_id);
  console.log(video);
  return (
    <main className="flex flex-col gap-2 justify-center items-center ">
      <section className="flex justify-center items-center w-full p-4">
        <LinkInput />
      </section>

      <section className="flex justify-center items-center">
        <VideoPlayer videoId={params.video_id} />
      </section>
    </main>
  );
};

export default VideoPage;
