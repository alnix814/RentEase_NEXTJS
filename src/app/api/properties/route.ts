import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = Number(searchParams.get('page') || 1);
        const limit = Number(searchParams.get('limit') || 10);
        const id = searchParams.get('id') || undefined;

        if (id) {
            const property = await prisma.property.findUnique({
                where: {
                    id: id
                },
                include: {
                    PropertyImage: true,
                    user: true,
                },
            });

            if (!property) {
                return NextResponse.json({ error: 'Объект недвижимости не найден' }, { status: 404 });
            }

            return NextResponse.json({ property });
        }

        const properties = await prisma.property.findMany({
            take: limit,
            skip: (page - 1) * limit,
            include: {
                PropertyImage: true,
            },
            orderBy: {
                id: 'desc'
            }
        });

        const totalCount = await prisma.property.count();
        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page < totalPages;

        return NextResponse.json({ 
            properties, 
            hasMore,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount
            }
        });
    } catch (error) {
        console.error('Ошибка при получении объектов недвижимости:', error);
        return NextResponse.json(
            { error: 'Не удалось загрузить объекты недвижимости' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Проверка аутентификации
        const session = await getServerSession(options);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
        }

        // Получение данных пользователя
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            }
        });

        if (!user) {
            return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
        }

        // Получение данных формы
        const formData = await request.formData();
        
        // Извлечение полей объекта недвижимости
        const name = formData.get('name') as string;
        const type = formData.get('type') as string;
        const address = formData.get('address') as string;
        const price = Number(formData.get('price'));
        const settlement = formData.get('settlement') as string;
        const country = formData.get('country') as string;
        const bathroom = Number(formData.get('bathroom'));
        const floor = Number(formData.get('floor'));
        const near = formData.get('near') as string;
        const rooms = Number(formData.get('rooms'));
        const sleeping = Number(formData.get('sleeping'));
        
        // Проверка обязательных полей
        if (!name || !type || !address || !settlement || !country) {
            return NextResponse.json(
                { message: 'Отсутствуют обязательные поля' }, 
                { status: 400 }
            );
        }

        // Создание объекта недвижимости в базе данных
        const property = await prisma.property.create({
            data: {
                name,
                type,
                address,
                price,
                settlement,
                country,
                bathroom,
                floor,
                near,
                rooms,
                sleeping,
                userId: user.id,
                rate: 0,
            },
        });

        // Обработка изображений
        const images = formData.getAll('images');
        
        if (images && images.length > 0) {
            const imagePromises = images.map(async (image, index) => {
                // Здесь должна быть логика сохранения изображений
                // Это упрощенный пример - в реальном приложении нужно использовать
                // сервис хранения файлов (S3, Cloudinary и т.п.)
                
                if (image instanceof File) {
                    // Создаем запись для изображения
                    return prisma.propertyImage.create({
                        data: {
                            url: `https://example.com/image-${index}-${Date.now()}`, // Заглушка
                            propertyId: property.id,
                        }
                    });
                }
                return null;
            });
            
            await Promise.all(imagePromises.filter(Boolean));
        }

        return NextResponse.json(
            { 
                message: 'Объект недвижимости успешно создан', 
                property 
            }, 
            { status: 201 }
        );
    } catch (error) {
        console.error('Ошибка при создании объекта недвижимости:', error);
        return NextResponse.json({
            message: 'Не удалось создать объект недвижимости',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

// Обновление объекта недвижимости
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(options);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
        }

        const data = await request.json();
        const { id, ...updateData } = data;

        if (!id) {
            return NextResponse.json({ message: 'Не указан ID объекта недвижимости' }, { status: 400 });
        }

        // Проверка, что пользователь является владельцем объекта
        const propertyOwner = await prisma.property.findFirst({
            where: {
                id,
                user: {
                    email: session.user.email
                }
            }
        });

        if (!propertyOwner) {
            return NextResponse.json({ message: 'У вас нет прав на редактирование этого объекта' }, { status: 403 });
        }

        const updatedProperty = await prisma.property.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ 
            message: 'Объект недвижимости успешно обновлен', 
            property: updatedProperty 
        });
    } catch (error) {
        console.error('Ошибка при обновлении объекта недвижимости:', error);
        return NextResponse.json({
            message: 'Не удалось обновить объект недвижимости',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

// Удаление объекта недвижимости
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(options);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Не указан ID объекта недвижимости' }, { status: 400 });
        }

        // Проверка, что пользователь является владельцем объекта
        const propertyOwner = await prisma.property.findFirst({
            where: {
                id,
                user: {
                    email: session.user.email
                }
            }
        });

        if (!propertyOwner) {
            return NextResponse.json({ message: 'У вас нет прав на удаление этого объекта' }, { status: 403 });
        }

        // Сначала удаляем связанные изображения
        await prisma.propertyImage.deleteMany({
            where: {
                propertyId: id
            }
        });

        // Затем удаляем сам объект
        await prisma.property.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Объект недвижимости успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении объекта недвижимости:', error);
        return NextResponse.json({
            message: 'Не удалось удалить объект недвижимости',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}