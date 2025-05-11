import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(options);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }

    const { rentalId } = await request.json();

    if (!rentalId) {
      return NextResponse.json({ error: 'ID аренды не указан' }, { status: 400 });
    }

    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Получаем аренду
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { property: true }
    });

    if (!rental) {
      return NextResponse.json({ error: 'Аренда не найдена' }, { status: 404 });
    }

    // Проверяем, что пользователь является арендатором
    if (rental.userId !== user.id) {
      return NextResponse.json({ error: 'У вас нет прав на оплату этой аренды' }, { status: 403 });
    }

    // Проверяем статус аренды
    if (rental.status === 'PAID') {
      return NextResponse.json({ error: 'Эта аренда уже оплачена' }, { status: 400 });
    }

    if (rental.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Эта аренда была отменена' }, { status: 400 });
    }

    // В реальном приложении здесь была бы интеграция с платежной системой
    // Для демонстрационных целей просто обновляем статус

    // Обновляем статус аренды
    const updatedRental = await prisma.rental.update({
      where: { id: rentalId },
      data: { 
        status: 'PAID',
        updatedAt: new Date()
      }
    });

    // Создаем запись о платеже
    await prisma.payment.create({
      data: {
        rentalId,
        amount: rental.property.price,
        status: 'COMPLETED',
        paymentId: `demo-${Date.now()}`, // Для демонстрации
      }
    });

    return NextResponse.json({ 
      message: 'Оплата успешно проведена',
      rental: updatedRental
    });
  } catch (error) {
    console.error('Ошибка при обработке платежа:', error);
    return NextResponse.json({ 
      error: 'Не удалось обработать платеж',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}