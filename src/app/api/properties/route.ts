import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = Number(searchParams.get('page') || 1);
        const limit = Number(searchParams.get('limit') || 10);

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

    const user = await getServerSession(options);

    const user_db = await prisma.user.findUnique({
        where: {
            email: user?.user?.email || '',
        }
    })

    try {
        const data = await request.json();
        const property = await prisma.property.create({
            data: {
                ...data,
                userId: user_db?.id,
            }
        });
        return NextResponse.json(property, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Не удалось создать свойство', error: error }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    }

    try {
        await prisma.property.delete({ where: { id } });
        return NextResponse.json({ message: 'Свойство удалено' });
    } catch (error) {
        return NextResponse.json({ message: 'Не удалось удалить свойство', error: error }, { status: 500 });
    }
}

