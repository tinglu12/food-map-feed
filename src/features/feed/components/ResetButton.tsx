import { Button } from "@/components/ui/button";
import React from "react";
import { useVideos } from "../hooks/useVideos";
import { RefreshCcw } from "lucide-react";
export const ResetButton = () => {
  const { resetHistory, isResetting } = useVideos();
  const handleReset = async () => {
    await resetHistory();
  };
  return (
    <Button
      variant="outline"
      onClick={handleReset}
      disabled={isResetting}
      className="cursor-pointer"
    >
      <RefreshCcw className="mr-2 h-4 w-4" />
      Reset
    </Button>
  );
};
