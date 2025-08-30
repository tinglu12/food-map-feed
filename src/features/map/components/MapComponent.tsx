"use client";

import React from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import RestaurantSidebar from "./RestaurantDisplay";

import { restaurantData } from "@/types/restaurant";

import "leaflet/dist/leaflet.css";
import { useFavorites } from "../hooks/useFavorites";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom favorite marker icon
const favoriteIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapComponentProps {
  coordinates: { latitude: number; longitude: number };
  onVideoChange?: (videoId: string) => void;
  videoId?: string;
  name?: string;
}

const MapComponent = ({ coordinates, onVideoChange, videoId, name }: MapComponentProps) => {
  console.log("Coordinates:", coordinates);
  const { data, error } = useFavorites();

  const favoriteData = data?.filter((favorite) => favorite.videoId !== videoId);

  console.log("Favorites:", data);
  // Check if coordinates are valid numbers
  if (
    !coordinates.latitude ||
    !coordinates.longitude ||
    isNaN(coordinates.latitude) ||
    isNaN(coordinates.longitude)
  ) {
    console.log("Invalid coordinates, not rendering marker");
    return (
      <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={false} className="w-full h-[50vh]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[coordinates.latitude, coordinates.longitude]}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {favoriteData?.map((favorite) => (
          <Marker
            key={favorite.videoId}
            position={[favorite.latitude, favorite.longitude]}
            icon={favoriteIcon}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{favorite.name}</h3>
                <button
                  onClick={() => onVideoChange?.(favorite.videoId)}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Watch Video
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        <Marker position={[coordinates.latitude, coordinates.longitude]}>
          <Popup>{name || "Video Location"}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
