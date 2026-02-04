import React from "react";
import { useVideos } from "../hooks/useFeed";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  videoId: string;
  isFavorite: boolean | undefined;
}

const FavoriteButton = ({ videoId, isFavorite }: FavoriteButtonProps) => {
  const { favoriteVideo, isFavoriting, unfavoriteVideo, isUnfavoriting } = useVideos();
  const handleFavoriteVideo = async () => {
    await favoriteVideo(videoId);
  };
  const handleUnfavoriteVideo = async () => {
    await unfavoriteVideo(videoId);
  };

  const buttonText = isFavoriting ? "Favoriting..." : isFavorite ? "Unfavorite" : "Favorite";
  const buttonDisabled = isFavoriting || isUnfavoriting;

  return (
    <div>
      <Button
        onClick={isFavorite ? handleUnfavoriteVideo : handleFavoriteVideo}
        disabled={buttonDisabled}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default FavoriteButton;
