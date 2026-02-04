import { RestaurantData } from "@/types/restaurant";

export type VideoData = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  latitude: number;
  longitude: number;
  locationDescription: string;
  restaurants: RestaurantData[] | null;
  isFavorite: boolean;
};

export type LocationData = {
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

export type ReturnedVideo = VideoData & {
  is_active: boolean;
  is_favorite: boolean;
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
