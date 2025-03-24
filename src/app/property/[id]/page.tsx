'use client';

import { Toast_Custom } from "@/components/ui/toast_custom";
import { Property, PropertyImage, User } from "@prisma/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import React from "react";
import { cn } from "@/lib/utils";
import { TiStarFullOutline } from "react-icons/ti";
import { AiOutlineLoading } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {

    const params = useParams();
    const id = params.id as string;

    const [isHovered, setIsHovered] = React.useState(false);
    const [property, setProperty] = useState<Property | null>(null);
    const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
    const [owner, setOwner] = useState<User | null>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            setLoading(true);

            const response = await fetch(`/api/properties?id=${id}`, {
                method: 'GET',
                cache: 'no-store',
            },)

            if (response.ok) {
                const result = await response.json();

                console.log(result);

                setProperty(result.property);
                setPropertyImages(result.property.PropertyImage);
                setOwner(result.property.user);
                setLoading(false);
            } else {
                Toast_Custom({ errormessage: 'Не удалось загрузить данные', setError: () => { }, type: 'error' })
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    return (
        <>
            {loading ? (
                <div className="h-[90vh] flex items-center justify-center">
                    <div className="animate-spin">
                        <AiOutlineLoading size={70} />
                    </div>
                </div>
            ) : (
                <section className="h-[90vh]">
                    <div className="grid mx-3 mt-10 h-60 xl:mx-10 xl:mt-20 xl:flex xl:h-2/3 xl:gap-10">
                        <div className="rounded-xl h-60 xl:w-1/2 xl:h-full w-full overflow-auto"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <Carousel>
                                <CarouselContent>
                                    {propertyImages.map((image, index) => (
                                        <CarouselItem key={index} className="relative w-full h-[238px] object-cover xl:h-[562px]">
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
                        <div className="pt-8 flex flex-col gap-1">
                            <h2 className="font-bold text-xl">{property?.name}</h2>
                            <span className="flex items-center gap-1"><TiStarFullOutline color="orange" />{property?.rate}</span>

                            <div className="mt-7 ">
                                <table className="text-base">
                                    <tbody className="flex flex-col gap-2">
                                        <tr className="flex gap-5 w-full">
                                            <th className="text-muted-foreground font-normal text-left w-40">Адрес</th>
                                            <td className="text-left">{property?.address}</td>
                                        </tr>
                                        <tr className="flex gap-5">
                                            <th className="text-muted-foreground font-normal text-left w-40">Населенный пункт</th>
                                            <td className="text-left">{property?.settlement}</td>
                                        </tr>
                                        <tr className="flex gap-5">
                                            <th className="text-muted-foreground font-normal text-left w-40">Страна</th>
                                            <td className="text-left">{property?.country}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="border rounded-2xl shadow-lg p-5 mt-6 xl:h-2/3 xl:w-1/6 ">
                            <div className="">
                                <p><span className="font-bold text-3xl">{Number(property?.price.toLocaleString())} ₽</span><span className="text-muted-foreground"> месяц</span></p>
                            </div>
                            <div className="mt-10 flex flex-col gap-2 ">
                                <Button className="w-full rounded-xl h-12 text-md">Добавить в отложенное</Button>
                                <Button className="w-full rounded-xl h-12 text-md bg-gray-200 hover:bg-gray-300" variant={'outline'}>Арендовать</Button>
                            </div>
                            <div className="mt-5 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarImage src={owner?.avatarUrl as string}/>
                                        <AvatarFallback>{owner?.name?.slice(0, 2).toUpperCase() ?? "CN"}</AvatarFallback>
                                    </Avatar>

                                    <p className="font-semibold">
                                        {owner?.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">26-31 марта</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            )}
        </>
    )
}