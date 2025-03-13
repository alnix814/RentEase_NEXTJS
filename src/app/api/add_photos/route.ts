import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const UNSPLASH_ACCESS_KEY = "DiDJPeOwcNt1cE0-r5E3I8P7ETA9JYgFInm8emYJk-M";
const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";

interface Image {
    urls: {
      full: string;
    };
  }

export async function POST() {
    try {
        const properties = await prisma.property.findMany();
        if (properties.length === 0) {
            return NextResponse.json({ error: "Нет доступных объектов" }, { status: 400 });
        }

        const savedImages = [];

        for (const property of properties) {
            const query = `${property.settlement || property.name} real estate`;

            const imageResponse = await fetch(`${UNSPLASH_API_URL}?query=${query}&per_page=3&client_id=${UNSPLASH_ACCESS_KEY}`);
            const imageData = await imageResponse.json();

            if (!imageData.results || imageData.results.length === 0) {
                console.warn(`Не найдено изображений для ${query}`);
                continue;
            }

            const imageUrls = imageData.results.map((img: Image) => img.urls.full);

            for (const imageUrl of imageUrls) {
                const savedImage = await prisma.propertyImage.create({
                    data: {
                        url: imageUrl,
                        propertyId: property.id,
                    },
                });

                savedImages.push(savedImage);
            }
        }

        return NextResponse.json({ message: `Добавлено ${savedImages.length} изображений`, images: savedImages });
    } catch (error) {
        console.error("Ошибка API:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
