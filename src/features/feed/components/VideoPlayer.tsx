import React from "react";

const VideoPlayer = ({ videoId }: { videoId: string }) => {
  return (
    <div className="w-[50vw] h-[50vh]">
      <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" />
    </div>
  );
};

export default VideoPlayer;
