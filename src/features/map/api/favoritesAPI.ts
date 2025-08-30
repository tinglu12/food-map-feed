import { createClient } from "@/utils/supabase/client";

export const getFavorites = async () => {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("video_favorites")
    .select(
      `
              videos (
          id,
          restaurants (
            id,
            name,
            address,
            rating,
            price_level,
            photos,
            latitude,
            longitude
          )
        )
    `,
    )
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching favorites:", error);
    throw error;
  }

  // Extract just the restaurant data from the nested structure
  console.log("Data:", data);
  const restaurants =
    data?.map((favorite: any) => favorite.videos?.restaurants).filter(Boolean) || [];
  console.log("Restaurants:", restaurants);
  const restaurantMapData =
    data?.map((favorite: any) => ({
      name: favorite.videos.restaurants.name,
      latitude: favorite.videos.restaurants.latitude,
      longitude: favorite.videos.restaurants.longitude,
      videoId: favorite.videos.id,
      restaurantId: favorite.videos.restaurants.id,
    })) || [];
  console.log("Restaurant map data:", restaurantMapData);
  return restaurantMapData;
};
