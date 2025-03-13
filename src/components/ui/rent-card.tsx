'use client';

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { TiStarFullOutline } from "react-icons/ti";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./carousel";
import React from "react";
import { cn } from "@/lib/utils";
import { Decimal } from "@prisma/client/runtime/library";

type CardProps = React.ComponentProps<typeof Card> & {
  imageSrc: string[];
  name: string;
  country: string;
  price: Decimal;
  rate: number;
  settlement: string;
  address: string;
}

export function CardDemo({
  className,
  imageSrc,
  name,
  address,
  settlement,
  country,
  price,
  rate,
}: CardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className={cn(className, "w-full sm:w-[300px] md:w-[330px] lg:w-[300px] rounded-xl overflow-hidden")}>
      <div
        className="relative w-full h-64"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Carousel>
          <CarouselContent>
            {imageSrc.map((image, index) => (
              <CarouselItem key={index} className="relative w-full h-64 overflow-hidden">
                {image ? (
                  <Image
                  src={image}
                  alt={`Property image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="w-full h-full"
                  quality={50}
                />
                ) : (
                  <div className="w-full h-full">К сожалению нет изображения</div>
                )}
                
              </CarouselItem>
            ))}
          </CarouselContent>

          {imageSrc.length > 1 && (
            <>
              <CarouselPrevious
                isHovered={isHovered}
                className={cn(
                  "transition-opacity absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-200",
                  !isHovered && "opacity-0"
                )}
              />
              <CarouselNext
                isHovered={isHovered}
                className={cn(
                  "transition-opacity absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-200",
                  !isHovered && "opacity-0"
                )}
              />
            </>
          )}
        </Carousel>
      </div>

      <div className="mt-2">
        <div className="flex justify-between items-center">
          <h5 className="text-mg font-semibold">
            {settlement} ({country})
          </h5>
          <div className="flex items-center gap-1">
            <TiStarFullOutline className="text-yellow-500" />
            <p>{rate}</p>
          </div>
        </div>

        <div className="mt-1">
          <p className="text-sm text-muted-foreground">{address}</p>
          <p className="text-sm text-muted-foreground">{name}</p>
        </div>

        <div className="mt-1">
          <p>
            <span className="text-md font-semibold">
              {Number(price.toLocaleString())}
            </span>
            ₽ месяц
          </p>
        </div>
      </div>
    </div>
  )
}
