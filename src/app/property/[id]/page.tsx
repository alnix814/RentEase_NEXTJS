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
import { useParams, useRouter } from "next/navigation";
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
import { Calendar } from "@/components/ui/calendar";
import { format, differenceInDays, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { FiCalendar, FiCreditCard, FiCheck, FiMessageCircle } from "react-icons/fi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CommentWithUser = Prisma.CommentsGetPayload<{
    include: { user: true };
}>;

export default function Home() {
    const params = useParams();
    const router = useRouter();
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
    const [step, setStep] = useState<'dates' | 'confirmation' | 'payment' | 'success'>('dates');
    const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchComments = async (id: string) => {
        const data = await fetch(`/api/fetchComments?id=${id}`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (data.ok) {
            setComments(await data.json());
        } else {
            console.log('Ошибка при загрузке комментариев')
        }
    }

    const fetchBookedDates = async (propertyId: string) => {
        try {
            const response = await fetch(`/api/availability?propertyId=${propertyId}`);
            if (response.ok) {
                const data = await response.json();
                const bookedDates: Date[] = [];

                data.bookings.forEach((booking: { startDate: string, endDate: string }) => {
                    const start = new Date(booking.startDate);
                    const end = new Date(booking.endDate);
                    let current = start;

                    while (current <= end) {
                        bookedDates.push(new Date(current));
                        current = addDays(current, 1);
                    }
                });

                setUnavailableDates(bookedDates);
            }
        } catch (error) {
            console.error('Ошибка при загрузке занятых дат:', error);
        }
    };

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
                fetchBookedDates(id);
                setCommentsLoading(false);

            } else {
                Toast_Custom({ errormessage: 'Не удалось загрузить данные', setError: () => { }, type: 'error' })
                setLoading(false);
            }
        };

        fetchData();
    }, [id, fetchCom]);

    useEffect(() => {
        // Расчет общей стоимости при изменении дат
        if (date?.from && date?.to && property) {
            const days = Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24));
            setTotalPrice(Number(property.price) * days);
        }
    }, [date, property]);

    useEffect(() => {
        // Получение недоступных дат для календаря
        const fetchUnavailableDates = async () => {
            if (!id) return;
            
            try {
                const response = await fetch(`/api/properties/availability?propertyId=${id}`, {
                    method: 'GET',
                    cache: 'no-store',
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Преобразуем строки дат в объекты Date
                    const dates = data.unavailableDates.map((dateStr: string) => new Date(dateStr));
                    setUnavailableDates(dates);
                }
            } catch (error) {
                console.error('Ошибка при получении недоступных дат:', error);
            }
        };
        
        fetchUnavailableDates();
    }, [id]);

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
                setStep('confirmation');
                Toast_Custom({ errormessage: 'Запрос на аренду создан', setError: () => { }, type: 'success' });
            } else {
                const data = await response.json();
                Toast_Custom({ errormessage: data.error, setError: () => { }, type: 'error' });
            }
        } catch (error) {
            Toast_Custom({ errormessage: 'Ошибка при отправке запроса', setError: () => { }, type: 'error' });
            return error
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
                setStep('success');
                Toast_Custom({ errormessage: 'Оплата успешно проведена', setError: () => { }, type: 'success' });
            } else {
                const data = await response.json();
                Toast_Custom({ errormessage: data.error, setError: () => { }, type: 'error' });
            }
        } catch (error) {
            Toast_Custom({ errormessage: 'Ошибка при обработке платежа', setError: () => { }, type: 'error' });
            return error
        } finally {
            setPaymentLoading(false);
        }
    };

    // Функция для проверки, является ли дата недоступной
    const isDateUnavailable = (date: Date) => {
        return unavailableDates.some(unavailableDate => 
            unavailableDate.getFullYear() === date.getFullYear() &&
            unavailableDate.getMonth() === date.getMonth() &&
            unavailableDate.getDate() === date.getDate()
        );
    };

    const handleContactOwner = () => {
        if (!session.data?.user) {
            Toast_Custom({ errormessage: 'Необходимо войти в систему', setError: () => { }, type: 'error' });
            router.push('/login');
            return;
        }

        // Здесь можно добавить логику для связи с владельцем
        Toast_Custom({ errormessage: 'Сообщение отправлено владельцу', setError: () => { }, type: 'success' });
    };

    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            // Сбрасываем состояние при закрытии диалога, если аренда не была успешной
            if (step !== 'success') {
                setRentalId(null);
                setDate(undefined);
            }
        }
    };

    const handleViewBookings = () => {
        router.push('/dashboard/rentals');
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
                                                    className="w-full h-full rounded-xl"
                                                    quality={80}
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
                                <div className="flex justify-between items-center">
                                    <h2 className="font-bold text-xl">{property?.name}</h2>
                                    <Badge variant="outline" className="bg-blue-50">
                                        <span className="flex items-center gap-1">
                                            <TiStarFullOutline color="orange" />{property?.rate}
                                        </span>
                                    </Badge>
                                </div>

                                <div className="mt-7">
                                    <table className="text-base w-full">
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
                                    <p><span className="font-bold text-3xl">{Number(property?.price).toLocaleString()} ₽</span><span className="text-muted-foreground"> сутки</span></p>
                                </div>
                                <div className="mt-10 flex flex-col gap-2">
                                    <Button
                                        className="w-full rounded-xl h-12 text-md flex items-center gap-2"
                                        onClick={handleContactOwner}
                                    >
                                        <FiMessageCircle />
                                        Связаться с владельцем
                                    </Button>
                                    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                                        <DialogTrigger asChild>
                                            <Button
                                                className="w-full rounded-xl h-12 text-md bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                                            >
                                                <FiCalendar />
                                                Арендовать
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px]">
                                            {step === 'success' ? (
                                                <div className="flex flex-col items-center py-6">
                                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                                        <FiCheck className="w-8 h-8 text-green-600" />
                                                    </div>
                                                    <h2 className="text-2xl font-bold mb-2">Аренда успешно оформлена!</h2>
                                                    <p className="text-center text-gray-600 mb-6">
                                                        Ваша аренда успешно оформлена и оплачена. Вы можете просмотреть детали в личном кабинете.
                                                    </p>
                                                    <Button onClick={handleViewBookings} className="w-full">
                                                        Перейти к моим арендам
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <DialogHeader>
                                                        <DialogTitle>Бронирование помещения</DialogTitle>
                                                        <DialogDescription>
                                                            Выберите даты аренды и оформите бронирование
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <Tabs defaultValue="dates" className="mt-4">
                                                        <TabsList className="grid w-full grid-cols-2">
                                                            <TabsTrigger value="dates">Выбор дат</TabsTrigger>
                                                            <TabsTrigger value="payment" disabled={!rentalId}>Оплата</TabsTrigger>
                                                        </TabsList>
                                                        <TabsContent value="dates" className="">
                                                            <div className="">
                                                                <Calendar
                                                                    mode="range"
                                                                    selected={date}
                                                                    onSelect={setDate}
                                                                    locale={ru}
                                                                    className="rounded-md border shadow flex items-center justify-center"
                                                                    disabled={isDateUnavailable}
                                                                    numberOfMonths={2}
                                                                />
                                                                {date?.from && date?.to && (
                                                                    <div className="">
                                                                        <p className="text-sm text-gray-700 mb-2">
                                                                            Вы выбрали период с {format(date.from, 'dd MMMM yyyy', { locale: ru })} по {format(date.to, 'dd MMMM yyyy', { locale: ru })}
                                                                        </p>
                                                                        {property && (
                                                                            <div className="space-y-2">
                                                                                <div className="flex justify-between text-sm">
                                                                                    <span>Стоимость за сутки:</span>
                                                                                    <span>{Number(property.price).toLocaleString()} ₽</span>
                                                                                </div>
                                                                                <div className="flex justify-between text-sm">
                                                                                    <span>Количество дней:</span>
                                                                                    <span>{differenceInDays(date.to, date.from) + 1}</span>
                                                                                </div>
                                                                                <div className="flex justify-between font-bold pt-2 border-t">
                                                                                    <span>Итого:</span>
                                                                                    <span>{totalPrice.toLocaleString()} ₽</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
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
                                                                        'Забронировать'
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </TabsContent>
                                                        <TabsContent value="payment" className="space-y-4">
                                                            <div className="border rounded-lg p-4 bg-green-50">
                                                                <h3 className="font-medium mb-2">Информация о бронировании</h3>
                                                                {date?.from && date?.to && (
                                                                    <div className="space-y-2 text-sm">
                                                                        <div className="flex justify-between">
                                                                            <span>Период аренды:</span>
                                                                            <span>{format(date.from, 'dd.MM.yyyy', { locale: ru })} - {format(date.to, 'dd.MM.yyyy', { locale: ru })}</span>
                                                                        </div>
                                                                        <div className="flex justify-between font-bold">
                                                                            <span>Итоговая сумма:</span>
                                                                            <span>{totalPrice.toLocaleString()} ₽</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="border rounded-lg p-4">
                                                                <h3 className="font-medium mb-4">Способ оплаты</h3>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center p-3 border rounded-md bg-blue-50">
                                                                        <input
                                                                            type="radio"
                                                                            id="card"
                                                                            name="payment"
                                                                            checked
                                                                            className="mr-2"
                                                                        />
                                                                        <label htmlFor="card" className="flex items-center gap-2">
                                                                            <FiCreditCard />
                                                                            Банковская карта
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
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
                                                        </TabsContent>
                                                    </Tabs>
                                                </>
                                            )}
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={comment.user.avatarUrl || ''} />
                                                    <AvatarFallback>{comment.user.name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{comment.user.name}</p>
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <TiStarFullOutline
                                                                key={i}
                                                                color={"orange"}
                                                                size={16}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-700">{comment.content}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    Пока нет отзывов для этого помещения
                                </div>
                            )}
                            {session.status === "authenticated" && (
                                <div className="mt-8 border-t pt-6">
                                    <h3 className="text-lg font-medium mb-4">Оставить отзыв</h3>
                                    <div className="flex mb-4">
                                        {[...Array(5)].map((_, index) => {
                                            const ratingValue = index + 1;
                                            return (
                                                <label key={index}>
                                                    <input
                                                        type="radio"
                                                        name="rating"
                                                        className="hidden"
                                                        value={ratingValue}
                                                        onClick={() => setRating(ratingValue)}
                                                    />
                                                    <TiStarFullOutline
                                                        className="cursor-pointer"
                                                        color={ratingValue <= (hover || rating) ? "orange" : "gray"}
                                                        size={30}
                                                        onMouseEnter={() => setHover(ratingValue)}
                                                        onMouseLeave={() => setHover(0)}
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <Textarea
                                        placeholder="Поделитесь своими впечатлениями о помещении..."
                                        className="min-h-[100px] mb-4"
                                        value={commentuser}
                                        onChange={(e) => setCommentuser(e.target.value)}
                                    />
                                    <Button onClick={() => setComments([])} disabled={!rating || !commentuser.trim()}>
                                        Отправить отзыв
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}