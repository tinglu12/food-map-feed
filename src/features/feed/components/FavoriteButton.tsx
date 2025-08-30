import React from "react";
import { useVideos } from "../hooks/useVideos";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  videoId: string;
  isFavorited: boolean | undefined;
}

const FavoriteButton = ({ videoId, isFavorited }: FavoriteButtonProps) => {
  const { favoriteVideo, isFavoriting, unfavoriteVideo, isUnfavoriting } = useVideos();
  const handleFavoriteVideo = async () => {
    await favoriteVideo(videoId);
  };
  const handleUnfavoriteVideo = async () => {
    await unfavoriteVideo(videoId);
  };

  const buttonText = isFavoriting ? "Favoriting..." : isFavorited ? "Unfavorite" : "Favorite";
  const buttonDisabled = isFavoriting || isUnfavoriting;

  return (
    <div>
      <Button
        onClick={isFavorited ? handleUnfavoriteVideo : handleFavoriteVideo}
        disabled={buttonDisabled}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default FavoriteButton;
