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
import { FaRegCommentDots } from "react-icons/fa";
import { Textarea } from "@/components/ui/textarea";

// Временная структура для комментариев, позже можно заменить на реальную из API
interface Comment {
    id: string;
    userId: string;
    user: {
        name: string;
        avatarUrl?: string;
    };
    content: string;
    createdAt: string;
}

export default function Home() {

    const params = useParams();
    const id = params.id as string;

    const [isHovered, setIsHovered] = React.useState(false);
    const [property, setProperty] = useState<Property | null>(null);
    const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
    const [owner, setOwner] = useState<User | null>();
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);

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

                // Здесь можно добавить загрузку комментариев, когда будет соответствующий API
                // Пример: fetchComments(id);
                setCommentsLoading(true);
                // Имитация загрузки комментариев
                setTimeout(() => {
                    // Временно пусто - потом здесь будут реальные комментарии из API
                    setComments([]);
                    setCommentsLoading(false);
                }, 800);

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
                <section className="h-full min-h-[90vh] pb-16">
                    <div className="flex mx-3 justify-between items-start mt-10 h-60 xl:mx-10 xl:mt-20 xl:flex xl:h-2/3">
                        <div className="rounded-xl row-span-2 h-60 xl:w-1/2 xl:h-full w-full overflow-auto"
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
                        <div className="xl:w-1/4 flex flex-1 justify-center items-center flex-col justify-between">
                            <div className="w-1/2 border rounded-2xl shadow-lg p-5">
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
                            <div className="border rounded-2xl shadow-lg p-5 mt-6 w-1/2">
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
                                            <AvatarImage src={owner?.avatarUrl as string} />
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
                    </div>

                    <div className="mt-12 mx-3 xl:mx-10 rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-6 border-b bg-gray-50">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <FaRegCommentDots className="text-blue-600" />
                                Отзывы посетителей
                            </h2>
                        </div>

                        <div className="p-6">
                            {commentsLoading ? (
                                <div className="flex justify-center items-center py-10">
                                    <div className="animate-spin">
                                        <AiOutlineLoading size={30} />
                                    </div>
                                </div>
                            ) : comments.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={comment.user.avatarUrl} />
                                                    <AvatarFallback>{comment.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{comment.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 line-clamp-3">{comment.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                                            <FaRegCommentDots className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Отзывов пока нет</h3>
                                        <p className="text-gray-500 max-w-md">
                                            Будьте первым, кто оставит отзыв об этом объекте недвижимости.
                                        </p>
                                    </div>
                                    <div className="flex">
                                        <Textarea className="w-1/3" />
                                        <Button>Отправить</Button>
                                    </div>
                                </div>

                            )}
                        </div>
                    </div>
                </section>
            )}
        </>
    )
}