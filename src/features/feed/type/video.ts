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
