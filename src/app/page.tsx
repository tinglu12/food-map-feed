import LinkInput from "@/features/link-input/components/LinkInput";
import Image from "next/image";
import VideoFeed from "@/features/feed/components/VideoFeed";
import VideoPlayer from "@/features/feed/components/VideoPlayer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-4xl font-bold text-blue-500">Food Map Feed</h1>
      <div className="w-full max-w-5xl ">
        <LinkInput />
      </div>
    </main>
  );
}
