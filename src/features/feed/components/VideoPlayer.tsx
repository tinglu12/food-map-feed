import React from "react";

const VideoPlayer = ({ videoId }: { videoId: string }) => {
  return (
    <div className="relative aspect-[9/16] rounded-lg overflow-hidden w-full h-full">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
        className="w-full h-full"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="YouTube Shorts"
      />
    </div>
  );
};

export default VideoPlayer;
