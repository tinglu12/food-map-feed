import React from "react";

const VideoPlayer = ({ videoId }: { videoId: string }) => {
  return (
    <div className="md:w-1/3 w-full h-full">
      <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" />
    </div>
  );
};

export default VideoPlayer;
