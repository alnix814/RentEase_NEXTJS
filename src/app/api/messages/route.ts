import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rentalId = searchParams.get('rentalId');

    if (!rentalId) {
      return new NextResponse('Rental ID is required', { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        rentalId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { rentalId, content } = body;

    if (!rentalId || !content) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        rentalId,
        senderId: session.user.id as string,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 