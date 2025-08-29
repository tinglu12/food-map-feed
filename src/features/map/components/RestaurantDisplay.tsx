import React from "react";
import { restaurantData } from "@/types/restaurant";
import { Card } from "@/components/ui/card";
import Image from "next/image";

const RestaurantDisplay = (restaurant: restaurantData) => {
  return (
    <Card className="flex flex-col p-4 md:w-1/3 w-full h-full overflow-y-auto">
      <h1>{restaurant.name}</h1>
      <p>{restaurant.address}</p>
      <p>{restaurant.rating}</p>
      <div className="flex flex-col gap-2 w-full">
        {restaurant.reviews.map((review) => (
          <div key={review.comment}>
            <p>{review.name}</p>
            <p>{review.comment}</p>
            <p>{review.rating}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RestaurantDisplay;
