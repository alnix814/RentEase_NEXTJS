import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { v2 as cloudinary } from "cloudinary";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(options);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        })

        const formData = await request.formData();
        const propertyId = formData.get('propertyId') as string;
        const images = formData.getAll('images');

        if (!propertyId) {
            return NextResponse.json({ message: 'Не указан ID объекта недвижимости' }, { status: 400 });
        }

        const property = await prisma.property.findFirst({
            where: {
                id: propertyId,
                user: {
                    email: session.user.email
                }
            }
        });

        if (!property) {
            return NextResponse.json(
                { message: 'Объект недвижимости не найден или у вас нет прав доступа' },
                { status: 403 }
            );
        }

        if (!images || images.length === 0) {
            return NextResponse.json({ message: 'Нет изображений для загрузки' }, { status: 400 });
        }

        const savedImages = [];

        for (let i = 0; i < images.length; i++) {
            const image = images[i];

            if (image instanceof File) {
                const arrayBuffer = await image.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`;

                const result = await cloudinary.uploader.upload(base64Image, {
                    folder: "RentEase/propertyImages",
                });

                const imageRecord = await prisma.propertyImage.create({
                    data: {
                        url: result.secure_url,
                        propertyId
                    }
                });

                savedImages.push(imageRecord);
            }
        }

        return NextResponse.json({
            message: 'Изображения успешно загружены',
            images: savedImages
        }, { status: 201 });
    } catch (error) {
        console.error('Ошибка при загрузке изображений:', error);
        return NextResponse.json({
            message: 'Не удалось загрузить изображения',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(options);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const imageId = searchParams.get('id');

        if (!imageId) {
            return NextResponse.json({ message: 'Не указан ID изображения' }, { status: 400 });
        }

        const image = await prisma.propertyImage.findUnique({
            where: { id: imageId },
            include: { property: { include: { user: true } } }
        });

        if (!image) {
            return NextResponse.json({ message: 'Изображение не найдено' }, { status: 404 });
        }

        if (image.property.user.email !== session.user.email) {
            return NextResponse.json({ message: 'У вас нет прав на удаление этого изображения' }, { status: 403 });
        }

        await prisma.propertyImage.delete({
            where: { id: imageId }
        });

        return NextResponse.json({ message: 'Изображение успешно удалено' });
    } catch (error) {
        console.error('Ошибка при удалении изображения:', error);
        return NextResponse.json({
            message: 'Не удалось удалить изображение',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
