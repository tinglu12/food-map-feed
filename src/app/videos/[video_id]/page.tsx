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

      <section className="flex md:flex-row flex-col justify-center items-center gap-2 w-full p-8 flex-1 overflow-hidden">
        {video.restaurant && <RestaurantDisplay {...video.restaurant} />}

        <MapCaller coordinates={{ latitude: video.latitude, longitude: video.longitude }} />
        <div className="md:w-1/3 h-full">
          <VideoPlayer videoId={video_id} />
        </div>
      </section>
    </main>
  );
};

export default VideoPage;
