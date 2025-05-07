import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(options);
        if (!session?.user) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        const { rentalId } = await req.json();

        if (!rentalId) {
            return NextResponse.json({ error: 'ID аренды не указан' }, { status: 400 });
        }

        // Получаем информацию об аренде
        const rental = await prisma.rental.findUnique({
            where: { id: rentalId },
            include: {
                property: true,
            },
        });

        if (!rental) {
            return NextResponse.json({ error: 'Аренда не найдена' }, { status: 404 });
        }

        if (rental.userId !== session.user.id) {
            return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
        }

        // Рассчитываем стоимость аренды
        const days = Math.ceil(
            (rental.endDate.getTime() - rental.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const amount = Number(rental.property.price) * days;

        // Создаем запись о платеже
        const payment = await prisma.payment.create({
            data: {
                rentalId,
                amount,
                status: 'pending',
            },
        });

        // Здесь будет интеграция с платежной системой
        // Для тестового примера просто эмулируем успешный платеж
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Обновляем статус платежа и аренды
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'completed',
                paymentId: 'test_payment_' + payment.id,
            },
        });

        await prisma.rental.update({
            where: { id: rentalId },
            data: {
                status: 'approved',
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Ошибка при обработке платежа:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}