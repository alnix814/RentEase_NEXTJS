'use client';

import { useState } from 'react';
import AddressInput from "@/components/ui/addressinput";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { 
    Home, Building2, Check, Info, Loader2, Camera, XCircle, 
    Bed, Bath, Currency, MapPin, Layers, Building
} from "lucide-react";
import { Toast_Custom } from '@/components/ui/toast_custom';
import { useSession } from "next-auth/react";
import { FiHome } from 'react-icons/fi';
import Image from 'next/image';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [type, setType] = useState<string>('apartment');
    const [loading, setLoading] = useState<boolean>(false);
    const [uploadingProgress, setUploadingProgress] = useState<number>(0);

    const rentFormSchema = z.object({
        name: z.string().min(3, { message: 'Нужно написать минимум 3 символа' }).max(30, { message: 'Максимальное количество символов: (30)' }),
        type: z.string().min(3, { message: 'Выберите тип объекта' }),
        address: z.string().min(3, { message: 'Укажите полный адрес' }),
        price: z.string().min(1, { message: 'Укажите цену' }).transform(val => Number(val)),
        settlement: z.string().min(3, { message: 'Укажите населенный пункт' }),
        country: z.string().min(1, { message: 'Укажите страну' }),
        bathroom: z.string().min(1, { message: 'Укажите количество санузлов' }).transform(val => Number(val)),
        floor: z.string().min(1, { message: 'Укажите этаж' }).transform(val => Number(val)),
        near: z.string().min(3, { message: 'Укажите что находится рядом' }),
        rooms: z.string().min(1, { message: 'Укажите количество комнат' }).transform(val => Number(val)),
        sleeping: z.string().min(1, { message: 'Укажите количество спальных мест' }).transform(val => Number(val)),
    });

    const rentForm = useForm<z.infer<typeof rentFormSchema>>({
        resolver: zodResolver(rentFormSchema),
        defaultValues: {
            name: "",
            type: type,
            address: "",
            price: 0,
            settlement: "",
            country: "",
            bathroom: 0,
            floor: 0,
            near: "",
            rooms: 0,
            sleeping: 0,
        },
    });

    const onRentSubmit = async (values: z.infer<typeof rentFormSchema>) => {
        try {
            if (!session?.user) {
                Toast_Custom({ errormessage: 'Необходимо авторизоваться', setError: () => { }, type: 'error' });
                return;
            }
            
            if (previewImages.length === 0) {
                Toast_Custom({ errormessage: 'Добавьте хотя бы одно изображение', setError: () => { }, type: 'error' });
                return;
            }

            setLoading(true);
            setUploadingProgress(10);
            
            const formData = new FormData();
            
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
            
            setUploadingProgress(30);

            const response = await fetch('/api/properties', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ошибка при отправке данных');
            }
            
            setUploadingProgress(60);
            
            if (data.property && data.property.id) {
                const imageFormData = new FormData();
                imageFormData.append("propertyId", data.property.id);
                
                const filePromises = previewImages.map(async (imgUrl, index) => {

                    const response = await fetch(imgUrl);
                    const blob = await response.blob();
                    return new File([blob], `image-${index}.jpg`, { type: 'image/jpeg' });
                });
                
                const imageFiles = await Promise.all(filePromises);
                
                imageFiles.forEach((file) => {
                    imageFormData.append("images", file);
                });
                
                setUploadingProgress(80);
                
                const imagesResponse = await fetch('/api/property-images', {
                    method: 'POST',
                    body: imageFormData,
                });
                
                if (!imagesResponse.ok) {
                    const imgError = await imagesResponse.json();
                    Toast_Custom({ errormessage: imgError.message || 'Ошибка при загрузке изображений', setError: () => { }, type: 'error' });
                }
            }
            
            setUploadingProgress(100);
            
            Toast_Custom({ errormessage: 'Объявление успешно опубликовано!', setError: () => { }, type: 'success' });
            rentForm.reset();
            setPreviewImages([]);
            
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            Toast_Custom({ 
                errormessage: error instanceof Error ? error.message : 'Произошла ошибка при публикации объявления', 
                setError: () => { }, 
                type: 'error' 
            });
        } finally {
            setLoading(false);
            setUploadingProgress(0);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            
            const oversizedFiles = filesArray.filter(file => file.size > 5 * 1024 * 1024);
            if (oversizedFiles.length > 0) {
                Toast_Custom({ 
                    errormessage: 'Размер файла не должен превышать 5 МБ', 
                    setError: () => { }, 
                    type: 'error' 
                });
                return;
            }
            
            const newPreviewImages = filesArray.map(file => URL.createObjectURL(file));
            setPreviewImages(prev => [...prev, ...newPreviewImages]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...previewImages];
        
        URL.revokeObjectURL(newImages[index]);
        
        newImages.splice(index, 1);
        setPreviewImages(newImages);
    };

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-full shadow-md">
                        <FiHome className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold">Разместите свою недвижимость</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
                            Заполните форму ниже, чтобы опубликовать объявление о сдаче вашей недвижимости.
                            Подробное описание и качественные фотографии помогут быстрее найти арендаторов.
                        </p>
                    </div>
                </div>
            </div>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-md rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-0">
                    <Tabs defaultValue="apartment" className="w-full">
                        <TabsList className="w-full rounded-none border-b border-gray-200 dark:border-gray-700 bg-transparent grid grid-cols-2">
                            <TabsTrigger
                                value="apartment"
                                onClick={() => {
                                    setType('apartment');
                                    rentForm.setValue('type', 'apartment');
                                }}
                                className="flex-1 py-4 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 data-[state=active]:shadow-none"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Building2 className="w-5 h-5" />
                                    <span className="font-medium">Квартира</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="house"
                                onClick={() => {
                                    setType('house');
                                    rentForm.setValue('type', 'house');
                                }}
                                className="flex-1 py-4 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 data-[state=active]:shadow-none"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Home className="w-5 h-5" />
                                    <span className="font-medium">Дом</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="apartment" className="p-6 pt-8">
                            <Form {...rentForm}>
                                <form onSubmit={rentForm.handleSubmit(onRentSubmit)} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <FormField
                                            control={rentForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                                        <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        Название
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-shadow"
                                                            {...field}
                                                            placeholder="Название объекта недвижимости" />
                                                    </FormControl>
                                                    <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                                        Укажите краткое и привлекательное название
                                                    </FormDescription>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={rentForm.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        Адрес
                                                    </FormLabel>
                                                    <FormControl>
                                                        <AddressInput
                                                            classname="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-shadow"
                                                            {...field}
                                                            filterr='house'
                                                            placeholder='Введите полный адрес' />
                                                    </FormControl>
                                                    <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                                        Укажите полный адрес объекта недвижимости
                                                    </FormDescription>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={rentForm.control}
                                            name="settlement"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        Населенный пункт
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Controller
                                                            name='settlement'
                                                            control={rentForm.control}
                                                            render={({ field }) => (
                                                                <AddressInput
                                                                    filterr='locality'
                                                                    {...field}
                                                                    placeholder='Город, посёлок и т.д.'
                                                                    classname="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-shadow"
                                                                />
                                                            )}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={rentForm.control}
                                            name="country"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        Страна
                                                    </FormLabel>
                                                    <FormControl>
                                                        <AddressInput
                                                            classname="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-shadow"
                                                            {...field}
                                                            filterr='country'
                                                            placeholder='Выберите страну' />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={rentForm.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                                        <Currency className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        Цена
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-3 pl-8 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-shadow"
                                                                {...field}
                                                                type="number"
                                                                min={1}
                                                                placeholder="Стоимость" />
                                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₽</span>
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                                        Укажите цену за сутки аренды
                                                    </FormDescription>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={rentForm.control}
                                            name="bathroom"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                                        <Bath className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        Количество санузлов
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-shadow"
                                                            {...field}
                                                            type="number"
                                                            min={1}
                                                            placeholder="Кол-во санузлов" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={rentForm.control}
                                            name="floor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                                        <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        Этаж
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-shadow"
                                                            {...field}
                                                            type="number"
                                                            min={1}
                                                            placeholder="Этаж" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={rentForm.control}
                                            name="near"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        Инфраструктура рядом
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-shadow"
                                                            {...field}
                                                            placeholder="Школа, метро, парк и т.д." />
                                                    </FormControl>
                                                    <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                                        Укажите важные объекты рядом
                                                    </FormDescription>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={rentForm.control}
                                            name="rooms"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                                        <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        Количество комнат
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-shadow"
                                                            {...field}
                                                            type="number"
                                                            min={1}
                                                            placeholder="Общее кол-во комнат" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={rentForm.control}
                                            name="sleeping"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                                        <Bed className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        Количество спальных мест
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-shadow"
                                                            {...field}
                                                            type="number"
                                                            min={1}
                                                            placeholder="Кол-во спальных мест" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2 mb-3">
                                            <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            Фотографии объекта
                                        </h3>

                                        <div className="flex flex-col items-center justify-center">
                                            <label className="w-full flex flex-col items-center px-4 py-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-all duration-200">
                                                    <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <span className="mt-3 text-base text-gray-900 dark:text-gray-100 font-medium">Загрузить фотографии</span>
                                                <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">PNG, JPG, WEBP до 5 МБ</span>
                                                <input
                                                    id="file-upload"
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        handleImageChange(e);
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>

                                        {previewImages.length > 0 && (
                                            <div className="mt-6">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Загруженные фотографии:</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                    {previewImages.map((img, i) => (
                                                        <div key={i} className="relative h-32 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 group">
                                                            <Image
                                                                src={img}
                                                                alt={`Preview ${i + 1}`}
                                                                className="w-full h-full object-cover"
                                                                width={100}
                                                                height={100}
                                                            />
                                                            <div className="absolute top-2 right-2 bg-green-500 bg-opacity-80 text-white rounded-full p-1">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(i)}
                                                                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                            >
                                                                <XCircle className="w-8 h-8 text-white" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                                        <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
                                            <Info className="w-4 h-4 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                                            <span className="text-sm">Все поля обязательны для заполнения</span>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white py-2 px-6 rounded-lg transition-colors w-full sm:w-auto"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span>Публикация... {uploadingProgress > 0 ? `${uploadingProgress}%` : ''}</span>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span>Опубликовать объявление</span>
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardHeader>
            </Card>
        </div>
    );
}