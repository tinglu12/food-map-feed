import React from "react";

const VideoPlayer = ({ videoId }: { videoId: string }) => {
  return (
    <div className="w-full h-full">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
        className="w-full h-full"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPlayer;
