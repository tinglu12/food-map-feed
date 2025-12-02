import { createClient } from "@/utils/supabase/server";
import { videoData, locationData } from "../type/video";
import { restaurantData } from "@/types/restaurant";
import { openai } from "@/lib/openai";

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

/**
 * Fetch video from YouTube API, process with AI, and save to database
 */
const fetchAndSaveVideo = async (videoId: string) => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,recordingDetails&id=${videoId}&key=${process.env.GOOGLE_API_KEY}`,
  );
  const data = await response.json();
  console.log("Data:", data);
  const tempVideoData = data.items?.[0];

  if (!tempVideoData) {
    return {
      error: "Video not found",
    };
  }
  console.log("Temp video data:", tempVideoData);
  const videoData: videoData = {
    id: tempVideoData.id,
    title: tempVideoData.snippet.title,
    description: tempVideoData.snippet.description,
    thumbnail: tempVideoData.snippet.thumbnails.maxres.url,
    latitude: tempVideoData.recordingDetails?.location?.latitude,
    longitude: tempVideoData.recordingDetails?.location?.longitude,
    locationDescription: tempVideoData.recordingDetails?.locationDescription,
    restaurant: null,
  };
  const locationResponse = await getLocation(videoData);
  if (!locationResponse.places || locationResponse.places.length === 0) {
    console.log("Location not found" + locationResponse.error);
    return {
      error: "Location not found",
      errorMessage: locationResponse.error,
    };
  }
  console.log("Location response:", locationResponse);
  const place = locationResponse.places[0];

  if (
    !videoData.latitude &&
    !videoData.longitude &&
    !place.location?.latitude &&
    !place.location?.longitude
  ) {
    const location = await getLatitudeLongitude(videoData, place);
    videoData.latitude = location.latitude;
    videoData.longitude = location.longitude;
  } else {
    videoData.latitude = place.location?.latitude;
    videoData.longitude = place.location?.longitude;
  }
  console.log("Video data:", videoData);
  videoData.restaurant = {
    name: place.displayName?.text || "Unknown",
    address: place.formattedAddress || "",
    priceLevel: place.priceLevel || 0,
    rating: place.rating || 0,
    photos: place.photos?.map((photo: any) => photo.name) || [],
    reviews:
      place.reviews?.map((review: any) => {
        return {
          name: review.authorAttribution?.displayName,
          comment: review.originalText?.text,
          rating: review.rating,
        };
      }) || [],
  };
  await uploadVideo(videoData);
  console.log("Uploaded video:", videoData);
  return videoData;
};

const getLocation = async (query: videoData) => {
  const endpoint = "https://places.googleapis.com/v1/places:searchText";
  const body = await getLocationFromPrompt(query);
  console.log("Body:", body);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_API_KEY as string,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.priceLevel,places.location,places.rating,places.photos,places.reviews",
    },
    body: JSON.stringify(body),
  });
  console.log("Response:", response);
  const data = await response.json();
  console.log("Data:", data);
  return data;
};

const getLocationFromPrompt = async (query: videoData) => {
  const systemPrompt = `You are a helpful assistant that can help me get the location of a video. Use the following data to get the name of the location. If you do not feel confident, return the location description.
  
    Data:
    Title: ${query.title}
    Location Description: ${query.locationDescription}
    Description: ${query.description}
    Latitude: ${query.latitude}
    Longitude: ${query.longitude}

    Return in form of:

    locationName: string (if you find the location name, if not, return the location description)
    locationDescription: string
  `;
  console.log("System prompt:", query.thumbnail);
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Here is the video thumbnail URL (if helpful): ${query.thumbnail}`,
      },
    ],
  });
  console.log("Response:", response);

  const prompt = `Use the following video data to get the location:
  Location Description: ${query.locationDescription}
  Location Name: ${response.choices[0].message.content}
  Description: ${query.description}
  Latitude: ${query.latitude}
  Longitude: ${query.longitude}
  `;
  return { textQuery: prompt };
};

const getLatitudeLongitude = async (videoData: videoData, locationData: locationData) => {
  const address = locationData.formattedAddress;
  const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_API_KEY}`;
  const response = await fetch(endpoint);
  const data = await response.json();
  return {
    latitude: data.results[0].geometry.location.lat,
    longitude: data.results[0].geometry.location.lng,
  };
};

export const uploadVideo = async (videoData: videoData) => {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const { data: existingVideo, error: videoError } = await supabase
    .from("videos")
    .select("*")
    .eq("id", videoData.id);

  if (videoError) {
    console.error("Error fetching video:", videoError);
  }
  if (existingVideo && existingVideo.length > 0) {
    return { data: existingVideo, error: null };
  }
  const { data, error } = await supabase.from("videos").insert({
    id: videoData.id,
    title: videoData.title,
    description: videoData.description,
    latitude: videoData.latitude,
    longitude: videoData.longitude,
    location_description: videoData.locationDescription,
    created_by: user?.user?.id,
  });

  const { data: restaurantData, error: restaurantError } = await supabase
    .from("restaurants")
    .insert({
      video_id: videoData.id,
      name: videoData.restaurant?.name,
      address: videoData.restaurant?.address,
      rating: videoData.restaurant?.rating,
      latitude: videoData.latitude,
      longitude: videoData.longitude,
      photos: videoData.restaurant?.photos,
    })
    .select()
    .single();

  if (restaurantError) {
    console.error("Error inserting restaurant:", restaurantError);
  }
  // Insert all reviews at once
  if (
    videoData.restaurant?.reviews &&
    videoData.restaurant.reviews.length > 0 &&
    restaurantData?.id
  ) {
    const reviewsToInsert = videoData.restaurant.reviews.map((review) => ({
      restaurant_id: restaurantData.id,
      author_name: review.name,
      comment: review.comment,
      rating: review.rating,
    }));

    const { data: restaurantReviews, error: restaurantReviewsError } = await supabase
      .from("restaurant_reviews")
      .insert(reviewsToInsert);

    if (restaurantReviewsError) {
      console.error("Error inserting restaurant reviews:", restaurantReviewsError);
    }
  }

  return { data, error };
};
