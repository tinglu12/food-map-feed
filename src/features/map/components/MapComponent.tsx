"use client";

import React from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import RestaurantSidebar from "./RestaurantDisplay";

import { restaurantData } from "@/types/restaurant";

import "leaflet/dist/leaflet.css";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapComponentProps {
  coordinates: { latitude: number; longitude: number };
}

const MapComponent = ({ coordinates }: MapComponentProps) => {
  console.log("Map coordinates:", coordinates);
  console.log("Latitude:", coordinates.latitude, "Longitude:", coordinates.longitude);

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
        <Marker position={[coordinates.latitude, coordinates.longitude]}>
          <Popup>Video Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
