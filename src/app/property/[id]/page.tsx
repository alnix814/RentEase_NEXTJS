'use client';

import { Toast_Custom } from "@/components/ui/toast_custom";
import { Property, PropertyImage } from "@prisma/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import React from "react";
import { cn } from "@/lib/utils";

export default function Home() {

    const params = useParams();
    const id = params.id as string;

    const [isHovered, setIsHovered] = React.useState(false);
    const [property, setProperty] = useState<Property | null>(null);
    const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            const response = await fetch(`/api/properties?id=${id}`, {
                method: 'GET',
                cache: 'no-store',
            },)

            if (response.ok) {
                const result = await response.json();

                console.log(result);

                setProperty(result.property);
                setPropertyImages(result.property.PropertyImage);
            } else {
                Toast_Custom({ errormessage: 'Не удалось загрузить данные', setError: () => { }, type: 'error' })
            }
        };

        fetchData();
    }, [id]);

    return (
        <section className="border h-[90vh]">
            <div className="border flex mx-6 mt-20 justify-between">
                <div className="rounded-xl border h-[500px] w-[800px] overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <Carousel>
                        <CarouselContent>
                            {propertyImages.map((image, index) => (
                                <CarouselItem key={index} className="relative w-full h-[500px] overflow-hidden">
                                    {image ? (
                                        <Image
                                            src={image.url}
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

                        {propertyImages.length > 1 && (
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
                <div>
                    {property?.country} fs
                </div>
            </div>
        </section>
    )
}