import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { StyledString } from 'next/dist/build/swc/types';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(options);
        if (!session?.user) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        const { propertyId, startDate, endDate } = await req.json();

        if (!propertyId || !startDate || !endDate) {
            return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
        }

        // Проверяем, не забронирована ли уже дата
        const existingRental = await prisma.rental.findFirst({
            where: {
                propertyId,
                OR: [
                    {
                        startDate: {
                            lte: new Date(endDate),
                        },
                        endDate: {
                            gte: new Date(startDate),
                        },
                    },
                ],
                status: {
                    in: ['pending', 'approved'],
                },
            },
        });

        if (existingRental) {
            return NextResponse.json(
                { error: 'Данные даты уже забронированы' },
                { status: 400 }
            );
        }

        const rental = await prisma.rental.create({
            data: {
                propertyId,
                userId: session.user.id as string,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });

        return NextResponse.json({ rentalId: rental.id });
    } catch (error) {
        console.error('Ошибка при создании аренды:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(options);
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const rentals = await prisma.rental.findMany({
            where: {
                OR: [
                    { userId: session.user.id as string },
                    { property: { userId: session.user.id as string} },
                ],
            },
            include: {
                property: {
                    include: {
                        PropertyImage: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(rentals);
    } catch (error) {
        console.error('Error fetching rentals:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}