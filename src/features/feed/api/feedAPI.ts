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
    isFavorited: returnedVideo.is_favorited,
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

export const favoriteVideo = async (videoId: string) => {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  const { error } = await supabase.from("video_favorites").insert({
    user_id: user?.user?.id,
    video_id: videoId,
  });
  return error;
};

export const unfavoriteVideo = async (videoId: string) => {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  const { error } = await supabase.from("video_favorites").delete().eq("video_id", videoId);
  return error;
};

export const loadVideoById = async (videoId: string) => {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: video, error } = await supabase
    .from("videos")
    .select(
      `
      *,
      restaurants (
        id,
        name,
        address,
        rating,
        price_level,
        photos,
        restaurant_reviews (
          id,
          author_name,
          rating,
          comment,
          created_at
        )
      )
    `,
    )
    .eq("id", videoId)
    .single();

  if (error) {
    console.error("Error loading video by ID:", error);
    throw error;
  }

  // Check if user has favorited this video
  const { data: favorite } = await supabase
    .from("video_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .single();

  // Map database data to videoData type
  const videoData: videoData = {
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnail: video.thumbnail || "",
    latitude: video.latitude,
    longitude: video.longitude,
    locationDescription: video.location_description || "",
    restaurant: video.restaurants
      ? {
          name: video.restaurants.name,
          address: video.restaurants.address,
          rating: video.restaurants.rating,
          priceLevel: video.restaurants.price_level,
          photos: video.restaurants.photos || [],
          reviews:
            video.restaurants.restaurant_reviews?.map((review: any) => ({
              id: review.id,
              author_name: review.author_name,
              rating: review.rating,
              comment: review.comment,
              time_description: review.created_at,
            })) || [],
        }
      : null,
    isFavorited: !!favorite,
  };

  return videoData;
};
