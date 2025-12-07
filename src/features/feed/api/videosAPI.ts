import { createClient } from "@/utils/supabase/server";
import { videoData } from "../type/video";
import { fetchAndSaveVideo } from "./videoPipeline";

/**
 * Check if video exists in database, return it if found
 */
export const getVideoFromDB = async (videoId: string): Promise<videoData | null> => {
  const supabase = await createClient();

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

  if (error || !video) {
    return null;
  }

  // Get current user for favorite status
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isFavorited = false;

  if (user) {
    const { data: favorite } = await supabase
      .from("video_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("video_id", videoId)
      .single();
    isFavorited = !!favorite;
  }

  return {
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnail: video.thumbnail_url || "",
    latitude: video.latitude,
    longitude: video.longitude,
    locationDescription: video.location_description || "",
    restaurant: video.restaurants
      ? {
          name: video.restaurants.name,
          address: video.restaurants.address,
          rating: video.restaurants.rating,
          priceLevel: video.restaurants.price_level || 0,
          photos: video.restaurants.photos || [],
          reviews:
            video.restaurants.restaurant_reviews?.map((review: any) => ({
              name: review.author_name,
              comment: review.comment,
              rating: review.rating,
            })) || [],
        }
      : null,
    isFavorited,
  };
};

/**
 * Get video - first checks DB, if not found fetches from YouTube and saves
 */
export const getVideo = async (
  videoId: string,
): Promise<videoData | { error: string; errorMessage?: string }> => {
  // First, check if video already exists in database
  const existingVideo = await getVideoFromDB(videoId);
  if (existingVideo) {
    return existingVideo;
  }

  // If not in DB, fetch from YouTube API
  return fetchAndSaveVideo(videoId);
};
