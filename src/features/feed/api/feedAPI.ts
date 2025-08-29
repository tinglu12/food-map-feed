import { createClient } from "@/utils/supabase/client";
import { returnedVideo, videoData } from "../type/video";

export const getFeed = async () => {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Get one random unwatched video
  const { data: unwatchedVideo, error: unwatchedVideoError } = await supabase.rpc(
    "get_one_unwatched_video",
    {
      user_uuid: user.id,
    },
  );

  if (unwatchedVideoError) {
    console.error("Error fetching unwatched video:", unwatchedVideoError);
    throw unwatchedVideoError;
  }

  const { error: watchedVideoError } = await supabase
    .from("watched_videos")
    .insert({
      user_id: user.id,
      video_id: unwatchedVideo?.[0].id,
    })
    .select()
    .single();

  if (watchedVideoError && watchedVideoError.code !== "23505") {
    // Ignore unique constraint violations
    console.error("Error marking video as watched:", watchedVideoError);
    throw watchedVideoError;
  }

  const returnedVideo = unwatchedVideo?.[0] as returnedVideo;
  console.log("Returned video:", returnedVideo);
  const video: videoData = {
    id: returnedVideo.id,
    title: returnedVideo.title,
    description: returnedVideo.description,
    thumbnail: returnedVideo.thumbnail,
    latitude: returnedVideo.latitude,
    longitude: returnedVideo.longitude,
    locationDescription: returnedVideo.locationDescription,
    restaurant: {
      name: returnedVideo.restaurant_name,
      address: returnedVideo.restaurant_address,
      rating: returnedVideo.restaurant_rating,
      priceLevel: 0,
      photos: returnedVideo.restaurant_photos,
      reviews: returnedVideo.restaurant_reviews,
    },
  };
  // Return the video or null if no unwatched videos
  return video || null;
};

export const resetHistory = async () => {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  const { error } = await supabase.from("watched_videos").delete().eq("user_id", user?.user?.id);
  return error;
};
