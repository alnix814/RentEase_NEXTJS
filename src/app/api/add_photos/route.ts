import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const UNSPLASH_ACCESS_KEY = "DiDJPeOwcNt1cE0-r5E3I8P7ETA9JYgFInm8emYJk-M";
const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

const userIds = [
    '1333b3b3-cb95-43ff-a936-2ea6dfd7f70e',
    '2e1c596c-cbc6-413d-9d17-9117cbaabb64',
    '3e2ca164-87f4-482a-9ef2-cdf79a05b9bb',
    '4ae5363a-ae91-49df-980b-b98fed2ccc1b',
    '942847d0-ff7b-465f-90ee-315bf7be79d3',
    '950e9106-26c3-415f-98f8-762c8b3ad4bf',
    'e34cbe8d-942b-4c47-8a3b-4c61e20170e1',
    'f96b7fd2-3198-42f7-88e1-aac87e7042db',
]

const types = ['apartment']
const settlements = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург']
const countries = ['Россия']
const nearPlaces = ['Парк', 'Метро', 'Школа', 'Супермаркет', 'Река', 'ТЦ']

interface Image {
    urls: {
        full: string;
    };
}

export async function POST() {
    try {
        const randomProperty = {
            userId: getRandomFromArray(userIds),
            name: `Жильё №${getRandomInt(1000, 9999)}`,
            type: getRandomFromArray(types),
            floor: getRandomInt(1, 25),
            rooms: getRandomInt(1, 5),
            sleeping: getRandomInt(1, 6),
            bathroom: getRandomInt(1, 2),
            near: getRandomFromArray(nearPlaces),
            address: `ул. ${getRandomFromArray(['Центральная', 'Ленина', 'Пушкина', 'Гагарина'])}, д. ${getRandomInt(1, 100)}`,
            price: getRandomInt(10000, 60000),
            settlement: getRandomFromArray(settlements),
            country: getRandomFromArray(countries),
            rate: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
        };

        const property = await prisma.property.create({
            data: randomProperty,
        });

        const query = `${property.settlement || property.name} real estate`;

        const imageResponse = await fetch(`${UNSPLASH_API_URL}?query=${query}&per_page=3&client_id=${UNSPLASH_ACCESS_KEY}`);
        const imageData = await imageResponse.json();

        const imageUrls = imageData.results.map((img: Image) => img.urls.full);

        const savedImages = await Promise.all(
            imageUrls.map((url: string) =>
                prisma.propertyImage.create({
                    data: {
                        url,
                        propertyId: property.id,
                    },
                })
            )
        );

        return NextResponse.json({ message: `Добавлено ${savedImages.length} изображений`, images: savedImages });
    } catch (error) {
        console.error("Ошибка API:", error);
        return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
    }
}

