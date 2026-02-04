import React from "react";
import { RestaurantData } from "@/types/restaurant";
import { Card } from "@/components/ui/card";
import Image from "next/image";

const RestaurantDisplay = (restaurants: RestaurantData) => {
  console.log("Restaurants:", restaurants);
  return (
    <Card className="flex flex-col p-4 md:w-1/4 w-full h-full overflow-y-auto z-100 ">
      <h1>{restaurants.name}</h1>
      <p>{restaurants.address}</p>
      <p>{restaurants.rating}</p>
      <div className="flex flex-col gap-2 w-full">
        {restaurants.reviews.map((review: any) => (
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
