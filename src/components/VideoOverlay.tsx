import VideoFeed from "@/features/feed/components/VideoFeed";
import { VideoData } from "@/features/feed/type/video";
import RestaurantDisplay from "@/features/map/components/RestaurantDisplay";
import LinkInput from "@/features/link-input/components/LinkInput";
import VideoPlayer from "@/features/feed/components/VideoPlayer";

export const VideoOverlay = ({ video }: { video: VideoData }) => {
  if (!video.restaurants || video.restaurants.length === 0) {
    return null;
  }
  return (
    <div className="absolute left-0 right-0 top-[var(--header-height)] h-[calc(100%-var(--header-height))] z-10 overflow-hidden pointer-events-none">
      <div className="flex flex-col w-full h-full min-h-0 p-4 justify-between pointer-events-none">
        <div className="flex justify-between min-h-0 overflow-hidden gap-2">
          <div className="pointer-events-auto">
            <RestaurantDisplay restaurants={video.restaurants} />
          </div>
          <div className="pointer-events-auto">
            <VideoPlayer videoId={video.id} />
          </div>
        </div>
        <div className="flex min-w-0 pointer-events-auto">
          <LinkInput />
        </div>
      </div>
    </div>
  );
};
