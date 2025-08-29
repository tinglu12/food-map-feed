import LinkInput from "@/features/link-input/components/LinkInput";
import Image from "next/image";
import VideoFeed from "@/features/feed/components/VideoFeed";
import VideoPlayer from "@/features/feed/components/VideoPlayer";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2">
      <h1 className="text-4xl font-bold text-blue-500">Food Map Feed</h1>
      <LinkInput />
    </div>
  );
}
