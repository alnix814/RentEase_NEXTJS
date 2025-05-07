'use client';

import { Toast_Custom } from "@/components/ui/toast_custom";
import { Prisma, Property, PropertyImage, User } from "@prisma/client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { useSession } from "next-auth/react";
import Star from "@/components/ui/star";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { DateRange } from "react-day-picker";

type CommentWithUser = Prisma.CommentsGetPayload<{
    include: { user: true };
}>;

export default function Home() {

    const params = useParams();
    const id = params.id as string;

    const [isHovered, setIsHovered] = React.useState(false);
    const [property, setProperty] = useState<Property | null>(null);
    const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
    const [owner, setOwner] = useState<User | null>();
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<CommentWithUser[]>([]);
    const [commentuser, setCommentuser] = useState<string>("");
    const [fetchCom, setFetchcom] = useState<boolean>(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const session = useSession();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [date, setDate] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });
    const [rentalLoading, setRentalLoading] = useState(false);
    const [rentalId, setRentalId] = useState<string | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const fetchComments = async (id: string) => {

        const data = await fetch(`/api/fetchComments?id=${id}`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (data.ok) {
            setComments(await data.json());
        } else {
            console.log('sgfasf')
        }

    }

    useEffect(() => {
        setFetchcom(false);
        const fetchData = async () => {
            if (!id) return;

            setLoading(true);

            const response = await fetch(`/api/properties?id=${id}`, {
                method: 'GET',
                cache: 'no-store',
            },)

            if (response.ok) {
                const result = await response.json();

                setProperty(result.property);
                setPropertyImages(result.property.PropertyImage);
                setOwner(result.property.user);
                setLoading(false);

                setCommentsLoading(true);

                fetchComments(id);

                setCommentsLoading(false);

            } else {
                Toast_Custom({ errormessage: 'Не удалось загрузить данные', setError: () => { }, type: 'error' })
                setLoading(false);
            }
        };

        fetchData();
    }, [id, fetchCom]);

    const sendComment = async () => {

        const response = await fetch(`/api/fetchComments`, {
            method: "POST",
            body: JSON.stringify({
                userId: session.data?.user.id,
                propertyId: id,
                content: commentuser,
                createdAt: new Date().toISOString(),
                rate: rating,
            })
        });

        if (response.ok) {
            setFetchcom(true);
            setRating(0);
            setCommentuser("");
        } else {
            const data = await response.json();
            Toast_Custom({ errormessage: data.error, setError: () => { }, type: 'error' });
        }

    }

    const handleRent = async () => {
        if (!date?.from || !date?.to) {
            Toast_Custom({ errormessage: 'Выберите даты аренды', setError: () => { }, type: 'error' });
            return;
        }

        setRentalLoading(true);
        try {
            const response = await fetch('/api/rentals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    propertyId: id,
                    startDate: date.from,
                    endDate: date.to,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setRentalId(data.rentalId);
                Toast_Custom({ errormessage: 'Запрос на аренду отправлен', setError: () => { }, type: 'success' });
            } else {
                const data = await response.json();
                Toast_Custom({ errormessage: data.error, setError: () => { }, type: 'error' });
            }
        } catch (error) {
            Toast_Custom({ errormessage: 'Ошибка при отправке запроса', setError: () => { }, type: 'error' });
        } finally {
            setRentalLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!rentalId) return;

        setPaymentLoading(true);
        try {
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rentalId }),
            });

            if (response.ok) {
                Toast_Custom({ errormessage: 'Оплата успешно проведена', setError: () => { }, type: 'success' });
                setRentalId(null);
                setDate(undefined);
            } else {
                const data = await response.json();
                Toast_Custom({ errormessage: data.error, setError: () => { }, type: 'error' });
            }
        } catch (error) {
            Toast_Custom({ errormessage: 'Ошибка при обработке платежа', setError: () => { }, type: 'error' });
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <>
            {loading ? (
                <div className="h-[90vh] flex items-center justify-center">
                    <div className="animate-spin">
                        <AiOutlineLoading size={70} />
                    </div>
                </div>
            ) : (
                <section className="h-full min-h-[90vh] pb-16 xl:mx-10">
                    <div className="grid mx-3 xl:mx-0 xl:justify-between xl:items-start mt-10 h-60 xl:mt-20 xl:flex xl:h-2/3">
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
                        <div className="xl:w-1/4 xl:flex xl:flex-1 xl:justify-center xl:items-center xl:flex-col xl:justify-between">
                            <div className="xl:w-1/2 border rounded-2xl shadow-lg p-5 my-2">
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
                            <div className="border rounded-2xl shadow-lg p-5 my-2 xl:mt-6 xl:w-1/2">
                                <div className="">
                                    <p><span className="font-bold text-3xl">{Number(property?.price.toLocaleString())} ₽</span><span className="text-muted-foreground"> месяц</span></p>
                                </div>
                                <div className="mt-10 flex flex-col gap-2 ">
                                    <Button className="w-full rounded-xl h-12 text-md">Добавить в отложенное</Button>
                                    <Dialog>
                                        <DialogTrigger className="w-full rounded-xl h-12 text-md bg-gray-200 hover:bg-gray-300 duration-200">Арендовать</DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Выберите даты аренды</DialogTitle>
                                                <DialogDescription>
                                                    <div className="flex flex-col gap-4 mt-4">
                                                        <Calendar
                                                            mode="range"
                                                            selected={date}
                                                            onSelect={setDate}
                                                            locale={ru}
                                                            className="rounded-md border"
                                                        />
                                                        {date?.from && date?.to && (
                                                            <div className="text-center">
                                                                <p className="text-sm text-gray-500">
                                                                    Вы выбрали период с {format(date.from, 'dd MMMM yyyy', { locale: ru })} по {format(date.to, 'dd MMMM yyyy', { locale: ru })}
                                                                </p>
                                                                {property && (
                                                                    <p className="text-sm font-medium mt-2">
                                                                        Стоимость: {Number(property.price) * Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))} ₽
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                        {!rentalId ? (
                                                            <Button 
                                                                onClick={handleRent} 
                                                                disabled={rentalLoading || !date?.from || !date?.to}
                                                                className="w-full"
                                                            >
                                                                {rentalLoading ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <AiOutlineLoading className="animate-spin" />
                                                                        Отправка запроса...
                                                                    </div>
                                                                ) : (
                                                                    'Отправить запрос на аренду'
                                                                )}
                                                            </Button>
                                                        ) : (
                                                            <Button 
                                                                onClick={handlePayment} 
                                                                disabled={paymentLoading}
                                                                className="w-full bg-green-600 hover:bg-green-700"
                                                            >
                                                                {paymentLoading ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <AiOutlineLoading className="animate-spin" />
                                                                        Обработка платежа...
                                                                    </div>
                                                                ) : (
                                                                    'Оплатить'
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </DialogDescription>
                                            </DialogHeader>
                                        </DialogContent>
                                    </Dialog>

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

                    <div className="mt-[560px] xl:mt-12 mx-3 xl:mx-0 rounded-xl border shadow-sm overflow-hidden">
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
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={comment.user.avatarUrl as string} />
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
                                    <Dialog>
                                        <DialogTrigger className="p-3 mt-2 rounded-xl h-12 text-md bg-gray-200 hover:bg-gray-300 duration-200">Оставить отзыв</DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Оставьте отзыв</DialogTitle>
                                                <DialogDescription>
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex ">
                                                            <Textarea className="border-black" value={commentuser} onChange={(e) => setCommentuser(e.target.value)} />
                                                            <div className="flex flex-col-reverse m-3">
                                                                {[...Array(5)].map((_, index) => {
                                                                    const starValue = index + 1;
                                                                    return (
                                                                        <button
                                                                            key={index}
                                                                            type="button"
                                                                            className={`text-4xl ${starValue <= (hover || rating) ? "text-[#FFA500]" : "text-gray-300"}`}
                                                                            onClick={() => {
                                                                                setRating(starValue);
                                                                            }}
                                                                            onMouseEnter={() => setHover(starValue)}
                                                                            onMouseLeave={() => setHover(0)}
                                                                        >
                                                                            <span className="text-4xl " > &#9733; </span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Button onClick={() => sendComment()}>Отправить</Button>
                                                        </div>
                                                    </div>
                                                </DialogDescription>
                                            </DialogHeader>
                                        </DialogContent>
                                    </Dialog>
                                </>

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
                                        <Dialog>
                                            <DialogTrigger className="p-3 mt-2 rounded-xl h-12 text-md bg-gray-200 hover:bg-gray-300 duration-200">Оставить отзыв</DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Оставьте отзыв</DialogTitle>
                                                    <DialogDescription>
                                                        <div className="flex flex-col gap-4">
                                                            <div className="flex ">
                                                                <Textarea className="border-black" value={commentuser} onChange={(e) => setCommentuser(e.target.value)} />
                                                                <div className="flex flex-col-reverse m-3">
                                                                    {[...Array(5)].map((_, index) => {
                                                                        const starValue = index + 1;
                                                                        return (
                                                                            <button
                                                                                key={index}
                                                                                type="button"
                                                                                className={`text-4xl ${starValue <= (hover || rating) ? "text-[#FFA500]" : "text-gray-300"}`}
                                                                                onClick={() => {
                                                                                    setRating(starValue);
                                                                                }}
                                                                                onMouseEnter={() => setHover(starValue)}
                                                                                onMouseLeave={() => setHover(0)}
                                                                            >
                                                                                <span className="text-4xl " > &#9733; </span>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Button onClick={() => sendComment()}>Отправить</Button>
                                                            </div>
                                                        </div>
                                                    </DialogDescription>
                                                </DialogHeader>
                                            </DialogContent>
                                        </Dialog>
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