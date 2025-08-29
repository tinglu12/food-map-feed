import { createClient } from "@/utils/supabase/server";
import { videoData, locationData } from "../type/video";
import { restaurantData } from "@/types/restaurant";

export const getVideo = async (videoId: string) => {
  console.log("Video ID:", videoId);
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,recordingDetails&id=${videoId}&key=${process.env.GOOGLE_API_KEY}`,
  );
  const data = await response.json();

  const tempVideoData = data.items?.[0];

  console.log("tempVideoData:", tempVideoData);

  if (!tempVideoData) {
    return {
      error: "Video not found",
    };
  }

  const videoData: videoData = {
    id: tempVideoData.id,
    title: tempVideoData.snippet.title,
    description: tempVideoData.snippet.description,
    thumbnail: tempVideoData.snippet.thumbnails.default.url,
    latitude: tempVideoData.recordingDetails?.location?.latitude,
    longitude: tempVideoData.recordingDetails?.location?.longitude,
    locationDescription: tempVideoData.recordingDetails?.locationDescription,
    restaurant: null,
  };

  const locationResponse = await getLocation(videoData);
  if (!locationResponse.places || locationResponse.places.length === 0) {
    return {
      error: "Location not found",
    };
  }

  const place = locationResponse.places[0];
  console.log("Place:", place);

  if (
    !videoData.latitude &&
    !videoData.longitude &&
    !place.location?.latitude &&
    !place.location?.longitude
  ) {
    const location = await getLatitudeLongitude(videoData, place);
    videoData.latitude = location.latitude;
    videoData.longitude = location.longitude;
  }

  videoData.restaurant = {
    name: place.displayName?.text || "Unknown",
    address: place.formattedAddress || "",
    priceLevel: place.priceLevel || 0,
    rating: place.rating || 0,
    photos: place.photos?.map((photo: any) => photo.flagContentUri) || [],
    reviews:
      place.reviews?.map((review: any) => {
        return {
          name: review.authorAttribution?.displayName,
          comment: review.originalText?.text,
          rating: review.rating,
        };
      }) || [],
  };
  console.log("Restaurant:", videoData.restaurant);
  const uploadedVideo = await uploadVideo(videoData);
  console.log("Uploaded video:", uploadedVideo);
  return videoData;
};

const getLocation = async (query: videoData) => {
  const endpoint = "https://places.googleapis.com/v1/places:searchText";
  const body = getLocationFromPrompt(query);
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

  const data = await response.json();
  console.log("Location data:", data);
  return data;
};

const getLocationFromPrompt = (query: videoData) => {
  const prompt = `Use the following video data to get the location:
  Location Description: ${query.locationDescription}
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
