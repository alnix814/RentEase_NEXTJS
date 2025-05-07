import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ChatWindow } from '@/components/chat/ChatWindow';

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const chat = await prisma.chat.findUnique({
    where: {
      id: params.id,
      OR: [
        { tenantId: session.user.id },
        { landlordId: session.user.id },
      ],
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      tenant: true,
      landlord: true,
    },
  });

  if (!chat) {
    redirect('/chat');
  }

  const otherUser = chat.tenantId === session.user.id ? chat.landlord : chat.tenant;

  const handleSendMessage = async (content: string) => {
    'use server';
    
    await prisma.message.create({
      data: {
        content,
        chatId: params.id,
        senderId: session.user.id,
      },
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Чат с {otherUser?.name || 'Пользователем'}
        </h1>
        <ChatWindow
          chatId={params.id}
          messages={chat.messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
} 