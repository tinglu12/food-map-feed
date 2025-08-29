export const getVideo = async (videoId: string) => {
  console.log(videoId);
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`,
  );
  const data = await response.json();
  return data;
};
