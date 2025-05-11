import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Не указан ID помещения' },
        { status: 400 }
      );
    }

    // Получаем все активные бронирования для данного помещения
    const bookings = await prisma.rental.findMany({
      where: {
        propertyId: propertyId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'PAID']
        }
      },
      select: {
        startDate: true,
        endDate: true
      }
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Ошибка при получении данных о доступности:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных о доступности' },
      { status: 500 }
    );
  }
}