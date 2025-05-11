import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

// Получение сообщений для конкретной аренды
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rentalId = searchParams.get('rentalId');

    if (!rentalId) {
      return NextResponse.json({ error: 'ID аренды не указан' }, { status: 400 });
    }

    // Проверка, имеет ли пользователь доступ к этой аренде
    const rental = await prisma.rental.findUnique({
      where: {
        id: rentalId,
        OR: [
          { userId: session.user.id as string },
          { property: { userId: session.user.id as string} }
        ]
      }
    });

    if (!rental) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // Получение сообщений
    const messages = await prisma.message.findMany({
      where: {
        rentalId: rentalId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Ошибка при получении сообщений:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// Отправка нового сообщения
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const { rentalId, content } = body;

    if (!rentalId || !content) {
      return NextResponse.json({ error: 'Отсутствуют обязательные поля' }, { status: 400 });
    }

    // Проверка, имеет ли пользователь доступ к этой аренде
    const rental = await prisma.rental.findUnique({
      where: {
        id: rentalId,
        OR: [
          { userId: session.user.id as string},
          { property: { userId: session.user.id as string} }
        ]
      }
    });

    if (!rental) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // Создание нового сообщения
    const message = await prisma.message.create({
      data: {
        content,
        rentalId,
        senderId: session.user.id as string
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}