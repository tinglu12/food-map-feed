import React from "react";
import { useVideos } from "../hooks/useVideos";
import { Button } from "@/components/ui/button";

const NextButton = () => {
  const { getNextVideo } = useVideos();
  const handleNextVideo = async () => {
    await getNextVideo();
  };
  return (
    <div>
      <Button onClick={handleNextVideo} className="cursor-pointer">
        Next
      </Button>
    </div>
  );
};

export default NextButton;
