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

            return NextResponse.json({ property });
        }

        const properties = await prisma.property.findMany({
            take: limit,
            skip: (page - 1) * limit,
            include: {
                PropertyImage: true,
            },
        });

        const hasMore = properties.length === limit;

        return NextResponse.json({ properties, hasMore });
    } catch (error) {
        console.error('Ошибка при получении свойств:', error);
        return NextResponse.json(
            { error: 'Не удалось загрузить свойства' },
            { status: 500 }
        );
    }
}


export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(options);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
        }

        const user_db = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            }
        });

        if (!user_db) {
            return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
        }

        const data = await request.json();

        const { images, ...propertyData } = data;

        const finalData = {
            ...propertyData,
            userId: user_db.id,
            rate: 0,
        };

        if (!data.name || !data.type || !data.address) {
            return NextResponse.json({ message: 'Отсутствуют обязательные поля' }, { status: 400 });
        }

        const property = await prisma.property.create({
            data: {
                ...finalData
            },
        });

        return NextResponse.json({ message: 'Свойство успешно создано', property: property }, { status: 201 });
    } catch (error) {
        console.log(error instanceof Error ? error.message : String(error));
        return NextResponse.json({
            message: 'Не удалось создать свойство',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}