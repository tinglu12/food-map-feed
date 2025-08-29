import { restaurantData } from "@/types/restaurant";

export type videoData = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  latitude: number;
  longitude: number;
  locationDescription: string;
  restaurant: restaurantData | null;
};

export type locationData = {
  displayName: string;
  formattedAddress: string;
  priceLevel: number;
  location: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  photos: any[];
  reviews: any[];
};

export type returnedVideo = videoData & {
  is_active: boolean;
  is_favorited: boolean;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_rating: number;
  restaurant_price_level: number;
  restaurant_photos: any[];
  restaurant_reviews: any[];
  created_at: string;
  updated_at: string;
  created_by: string;
};
