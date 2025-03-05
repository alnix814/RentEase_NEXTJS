"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import { TiStarFullOutline } from "react-icons/ti";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";
import React from "react";
import { cn } from "@/lib/utils";

type CardProps = React.ComponentProps<typeof Card> & {
  imageSrc: string[];
  name: string;
  address: string;
  price: number;
};

export function CardDemo({
  className,
  imageSrc,
  name,
  address,
  price,
  ...props
}: CardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className="w-full sm:w-[300px] md:w-[330px] lg:w-[240px] xl:w-[230px] h-full rounded-xl overflow-hidden">
      <div
        className="w-full h-[250px] flex justify-center items-center overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Carousel>
          <CarouselContent>
            {imageSrc.map((image, index) => (
              <CarouselItem className="w-full flex-shrink-0" key={index}>
                <Image
                  className="rounded-xl w-full h-full object-cover"
                  src={image}
                  width={500}
                  height={500}
                  quality={100}
                  alt="img"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            isHovered={isHovered}
            className={cn(
              "transition-opacity absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-200",
            )}
          ></CarouselPrevious>
          <CarouselNext
            isHovered={isHovered}
            className={cn(
              "transition-opacity absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-200",
            )}
          ></CarouselNext>
        </Carousel>
      </div>
      <div className="">
        <div className="mt-2 flex justify-between">
          <h5 className="text-mg font-semibold">Wychodne (Польша)</h5>
          <div className="flex items-center">
            <TiStarFullOutline />
            <p>4.79</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">4-9 мая</p>
        </div>
        <div>
          <p className="">
            <span className="text-md font-[600]">{price.toLocaleString()}</span>
            ₽ ночь
          </p>
        </div>
      </div>
    </div>
  );
}
