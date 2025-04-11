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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Home, Building2, Check, Info, Loader2, Camera, XCircle } from "lucide-react";
import { Toast_Custom } from '@/components/ui/toast_custom';

export default function DashboardPage() {
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [type, setType] = useState<string>('apartment');
    const [loading, setLoading] = useState<boolean>(false);

    const rentFormSchema = z.object({
        name: z.string().min(3, { message: 'Нужно написать минимум 3 символа' }).max(15, { message: 'Максимальное количество символов: (15)' }),
        type: z.string().min(3, { message: 'Нужно написать минимум 3 символа' }),
        address: z.string().min(3, { message: 'Нужно написать минимум 3 символа' }),
        price: z.string().min(1).transform(val => Number(val)),
        settlement: z.string().min(3, { message: 'Нужно написать минимум 3 символа' }),
        country: z.string().min(1, { message: 'Нужно написать минимум 1 символа' }),
        bathroom: z.string().min(1).transform(val => Number(val)),
        floor: z.string().min(1).transform(val => Number(val)),
        near: z.string().min(3, { message: 'Нужно написать минимум 3 символа' }),
        rooms: z.string().min(1).transform(val => Number(val)),
        sleeping: z.string().min(1).transform(val => Number(val)),
        images: z.array(z.instanceof(File)),
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
            images: [],
        },
    });

    const onRentSubmit = async (values: z.infer<typeof rentFormSchema>) => {
        try {
            setLoading(true);

            const response = await fetch('/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (response.ok) {

                const formData = new FormData();
                formData.append("propertyId", data.property.id);
                previewImages.map((img) => {
                    formData.append("images", img);
                });

                const response_images = await fetch('/api/property-images', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: formData,
                });

                if (response_images.ok) {
                    Toast_Custom({ errormessage: 'Объявление успешно опубликовано!', setError: () => { }, type: 'success' });
                    rentForm.reset();
                    setPreviewImages([]);
                } else {
                    Toast_Custom({ errormessage: 'Ошибка при отправке изображений', setError: () => { }, type: 'error' });
                }
            } else {
                Toast_Custom({ errormessage: data.message, setError: () => { }, type: 'error' });
                Toast_Custom({ errormessage: data.error, setError: () => { }, type: 'error' });
            }
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const newPreviewImages = filesArray.map(file => URL.createObjectURL(file));
            setPreviewImages(prev => [...prev, ...newPreviewImages]);

            rentForm.setValue('images', filesArray);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...previewImages];
        newImages.splice(index, 1);
        setPreviewImages(newImages);
    };

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8 flex items-center space-x-3">
                <div className="bg-black w-1 h-12 rounded"></div>
                <div>
                    <h1 className="text-3xl font-bold">Разместите свою недвижимость</h1>
                    <p className="text-gray-600 mt-1">Заполните форму ниже для публикации объявления</p>
                </div>
            </div>

            <Card className="border border-gray-200 shadow-md rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50 border-b border-gray-200 p-0">
                    <Tabs defaultValue="apartment" className="w-full">
                        <TabsList className="w-full rounded-none border-b border-gray-200 bg-transparent grid grid-cols-2">
                            <TabsTrigger
                                value="apartment"
                                onClick={() => {
                                    setType('apartment');
                                    rentForm.setValue('type', 'apartment');
                                }}
                                className="flex-1 py-4 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none"
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
                                className="flex-1 py-4 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none"
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
                                                    <FormLabel className="text-gray-700 font-medium">Название</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="bg-gray-50 border-gray-200 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-shadow"
                                                            {...field}
                                                            placeholder="Название объекта недвижимости" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={rentForm.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-medium">Адрес</FormLabel>
                                                    <FormControl>
                                                        <AddressInput
                                                            classname="bg-gray-50 border-gray-200 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-shadow"
                                                            {...field}
                                                            filterr='house'
                                                            placeholder='Введите полный адрес' />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={rentForm.control}
                                            name="settlement"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-medium">Населенный пункт</FormLabel>
                                                    <FormControl>
                                                        <Controller
                                                            name='settlement'
                                                            control={rentForm.control}
                                                            render={({ field }) => (
                                                                <AddressInput
                                                                    filterr='locality'
                                                                    {...field}
                                                                    placeholder='Город, посёлок и т.д.'
                                                                    classname="bg-gray-50 border-gray-200 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-shadow"
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
                                                    <FormLabel className="text-gray-700 font-medium">Страна</FormLabel>
                                                    <FormControl>
                                                        <AddressInput
                                                            classname="bg-gray-50 border-gray-200 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-shadow"
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
                                                    <FormLabel className="text-gray-700 font-medium">Цена</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                className="bg-gray-50 border-gray-200 rounded-lg p-3 pl-8 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-shadow"
                                                                {...field}
                                                                type="number"
                                                                min={1}
                                                                placeholder="Стоимость" />
                                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₽</span>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={rentForm.control}
                                            name="bathroom"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-medium">Количество санузлов</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="bg-gray-50 border-gray-200 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-shadow"
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
                                                    <FormLabel className="text-gray-700 font-medium">Этаж</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="bg-gray-50 border-gray-200 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-shadow"
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
                                                    <FormLabel className="text-gray-700 font-medium">Инфраструктура рядом</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="bg-gray-50 border-gray-200 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-shadow"
                                                            {...field}
                                                            placeholder="Школа, метро, парк и т.д." />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={rentForm.control}
                                            name="rooms"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-medium">Количество комнат</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="bg-gray-50 border-gray-200 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-shadow"
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
                                                    <FormLabel className="text-gray-700 font-medium">Количество спален</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="bg-gray-50 border-gray-200 rounded-lg p-3 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-shadow"
                                                            {...field}
                                                            type="number"
                                                            min={1}
                                                            placeholder="Кол-во спален" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
                                        <div className="text-gray-700 font-medium block mb-3">Фотографии объекта</div>

                                        <div className="flex flex-col items-center justify-center">
                                            <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-sm border border-gray-300 cursor-pointer hover:bg-gray-50 transition-all duration-200 group">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black bg-opacity-5 group-hover:bg-opacity-10 transition-all duration-200">
                                                    <Camera className="w-6 h-6 text-black" />
                                                </div>
                                                <span className="mt-3 text-base text-black font-medium">Загрузить фотографии</span>
                                                <span className="mt-1 text-sm text-gray-500">PNG, JPG, WEBP до 10 МБ</span>
                                                <input
                                                    id="file-upload"
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => {
                                                        handleImageChange(e);
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>

                                        {previewImages.length > 0 && (
                                            <div className="mt-6">
                                                <p className="text-sm font-medium text-gray-700 mb-3">Загруженные фотографии:</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                    {previewImages.map((img, i) => (
                                                        <div key={i} className="relative h-32 rounded-lg overflow-hidden shadow-sm border border-gray-200 group">
                                                            <img
                                                                src={img}
                                                                alt={`Preview ${i + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-1">
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
                                        <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                                            <Info className="w-4 h-4 mr-2 flex-shrink-0" />
                                            <span className="text-sm">Все поля обязательны для заполнения</span>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-black hover:bg-gray-800 text-white py-2 px-6 rounded-lg transition-colors w-full sm:w-auto"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span>Публикация...</span>
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

                        <TabsContent value="house" className="p-6 pt-8">
                            <Form {...rentForm}>
                                <form onSubmit={rentForm.handleSubmit(onRentSubmit)} className="space-y-8">
                                    {/* Same form fields as apartment but with house-specific content */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Copy of all form fields */}
                                        {/* ... */}
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