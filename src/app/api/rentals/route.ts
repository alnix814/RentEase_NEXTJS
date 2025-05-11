import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const rentals = await prisma.rental.findMany({
      where: {
        OR: [
          { userId: session.user.id as string },
          { property: { userId: session.user.id as string } }
        ]
      },
      include: {
        property: {
          include: {
            PropertyImage: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error('Ошибка при получении аренд:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(options);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }

    const { propertyId, startDate, endDate } = await request.json();

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Отсутствуют обязательные поля' }, { status: 400 });
    }

    // Проверяем, существует ли объект недвижимости
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json({ error: 'Объект недвижимости не найден' }, { status: 404 });
    }

    // Проверяем, не является ли пользователь владельцем объекта
    if (property.userId === session.user.id) {
      return NextResponse.json({ error: 'Вы не можете арендовать собственный объект' }, { status: 400 });
    }

    // Проверяем доступность дат
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Проверяем, что даты не в прошлом
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      return NextResponse.json({ error: 'Дата начала аренды не может быть в прошлом' }, { status: 400 });
    }

    if (end < start) {
      return NextResponse.json({ error: 'Дата окончания аренды не может быть раньше даты начала' }, { status: 400 });
    }

    // Проверяем, нет ли пересечений с существующими арендами
    const existingRentals = await prisma.rental.findMany({
      where: {
        propertyId,
        status: {
          in: ['CONFIRMED', 'PAID']
        },
        OR: [
          {
            // Начало новой аренды попадает в период существующей
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } }
            ]
          },
          {
            // Конец новой аренды попадает в период существующей
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: end } }
            ]
          },
          {
            // Новая аренда полностью покрывает существующую
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } }
            ]
          }
        ]
      }
    });

    if (existingRentals.length > 0) {
      return NextResponse.json({ error: 'Выбранные даты уже заняты' }, { status: 400 });
    }

    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Рассчитываем общую стоимость
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = Number(property.price) * days;

    // Создаем аренду
    const rental = await prisma.rental.create({
      data: {
        propertyId,
        userId: user.id,
        startDate: start,
        endDate: end,
        status: 'PENDING', // Статус "в ожидании"
      }
    });

    return NextResponse.json({ 
      message: 'Запрос на аренду успешно создан',
      rentalId: rental.id,
      totalPrice
    }, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании аренды:', error);
    return NextResponse.json({ 
      error: 'Не удалось создать запрос на аренду',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}