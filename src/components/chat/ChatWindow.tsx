'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    avatarUrl?: string | null;
  };
}

interface ChatWindowProps {
  chatId: string;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
}

export function ChatWindow({ chatId, messages, onSendMessage }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  // Инициализация локальных сообщений при получении новых сообщений из пропсов
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  // Настройка периодического опроса новых сообщений
  useEffect(() => {
    const fetchNewMessages = async () => {
      try {
        const response = await fetch(`/api/messages?rentalId=${chatId}`);
        if (response.ok) {
          const data = await response.json();
          // Обновляем только если есть новые сообщения
          if (data.length > localMessages.length) {
            setLocalMessages(data);
          }
        }
      } catch (error) {
        console.error('Ошибка при получении новых сообщений:', error);
      }
    };

    // Запускаем опрос каждые 3 секунды
    pollingIntervalRef.current = setInterval(fetchNewMessages, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [chatId, localMessages.length]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      await onSendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {localMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.senderId === session?.user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.senderId !== session?.user?.id && (
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={msg.sender.image || msg.sender.avatarUrl || ''} />
                      <AvatarFallback>
                        {msg.sender.name?.substring(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span className="text-xs font-medium">
                    {msg.senderId === session?.user?.id ? 'Вы' : msg.sender.name}
                  </span>
                  <span className="text-xs opacity-70">
                    {format(new Date(msg.createdAt), 'HH:mm', { locale: ru })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Введите сообщение..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isLoading || !newMessage.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}