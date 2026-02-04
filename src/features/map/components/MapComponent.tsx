"use client";

import RestaurantSidebar from "./RestaurantDisplay";

import { RestaurantData } from "@/types/restaurant";
import { useFavoritesVideosQuery } from "@/features/map/lib/useFavoriteQueries";

import { Map, MapMarker, MarkerContent, MarkerPopup, MarkerTooltip } from "@/components/ui/map";
import { Marker } from "leaflet";
import Link from "next/link";

interface MapComponentProps {
  coordinates: { latitude: number; longitude: number };
  onVideoChange?: (videoId: string) => void;
  videoId?: string;
  name?: string;
}

const MapComponent = ({ coordinates, onVideoChange, videoId, name }: MapComponentProps) => {
  console.log("Coordinates:", coordinates);
  const { data: favorites, error, isLoading } = useFavoritesVideosQuery();

  console.log("Favorites:", favorites);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <Map center={[coordinates.longitude, coordinates.latitude]} zoom={12}>
        {favorites?.map(
          (favorite: any) =>
            favorite.id !== videoId && (
              <MapMarker
                key={favorite.id}
                longitude={favorite.longitude}
                latitude={favorite.latitude}
              >
                <MarkerContent>
                  <Link href={`/videos/${favorite.id}`}>
                    <div className="size-4 rounded-full bg-primary border-2 border-white shadow-lg" />
                  </Link>
                </MarkerContent>
              </MapMarker>
            ),
        )}
        <MapMarker longitude={coordinates.longitude} latitude={coordinates.latitude}>
          <MarkerContent>
            <MarkerContent>
              <div className="size-4 rounded-full bg-primary border-2 border-white shadow-lg" />
            </MarkerContent>
            <MarkerPopup>{name || "Video Location"}</MarkerPopup>
          </MarkerContent>
        </MapMarker>
      </Map>
    </div>
  );
};

export default MapComponent;
