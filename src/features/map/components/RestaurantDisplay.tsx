import React from "react";
import { RestaurantData } from "@/types/restaurant";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

const RestaurantDisplay = ({ restaurants }: { restaurants: RestaurantData[] }) => {
  if (!restaurants || restaurants.length === 0) {
    return null;
  }
  return (
    <Card className="flex flex-col py-4 pl-4 pr-2 max-w-md w-full max-h-xl h-full">
      <ScrollArea className="h-full">
        <h1>{restaurants[0].name}</h1>
        <p>{restaurants[0].address}</p>
        <p>{restaurants[0].rating}</p>
        <div className="flex flex-col gap-2 w-full">
          {restaurants[0].reviews.map((review: any) => (
            <div key={review.comment}>
              <p>{review.name}</p>
              <p>{review.comment}</p>
              <p>{review.rating}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default RestaurantDisplay;
