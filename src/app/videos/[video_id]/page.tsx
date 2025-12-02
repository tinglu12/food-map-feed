import VideoContentDisplay from "@/components/VideoContentDisplay";
import { getVideo } from "@/features/feed/api/videosAPI";
import VideoPlayer from "@/features/feed/components/VideoPlayer";
import LinkInput from "@/features/link-input/components/LinkInput";
import MapCaller from "@/features/map/components/LazyMap";
import RestaurantDisplay from "@/features/map/components/RestaurantDisplay";

const VideoPage = async ({ params }: { params: Promise<{ video_id: string }> }) => {
  const { video_id } = await params;
  console.log("Resolved video_id:", video_id);

  if (!video_id) {
    return <div>No video ID provided</div>;
  }

  const video = await getVideo(video_id);
  console.log("Video:", video);
  if ("error" in video) {
    return <div>{video.error}</div>;
  }

  return (
    <main className="flex flex-col gap-2 justify-center items-center w-full h-screen overflow-hidden">
      <section className="flex justify-center items-center w-full p-4">
        <LinkInput />
      </section>
      <VideoContentDisplay video={video} />
    </main>
  );
};

export default VideoPage;
