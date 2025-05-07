'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface ChatWindowProps {
  chatId: string;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
}

export function ChatWindow({ chatId, messages, onSendMessage }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [socketMessages, setSocketMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const joinMessageRef = useRef<boolean>(false);

  const connectWebSocket = () => {
    try {
      if (wsRef.current) {
        wsRef.current.close();
      }

      wsRef.current = new WebSocket('ws://localhost:3001');

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          const newMessage: Message = {
            id: Date.now().toString(),
            content: data.content,
            senderId: data.senderId || 'unknown',
            createdAt: new Date(),
            sender: {
              id: data.senderId || 'unknown',
              name: data.username || 'Unknown',
              email: '',
              image: null
            }
          };
          setSocketMessages((prev) => [...prev, newMessage]);
        } else if (data.type === 'notification') {
          console.log('Notification:', data.content);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        joinMessageRef.current = false;
        
      };

      wsRef.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setIsConnected(false);
        setError('Ошибка подключения к серверу. Попытка переподключения...');
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Ошибка создания соединения');
      setIsConnected(false);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        console.log('WebSocket disconnecting...');
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'leave',
            room: chatId,
            username: session?.user?.name
          }));
        }
        wsRef.current.close();
      }
    };
  }, [chatId, session?.user?.name]);

  // Отправляем сообщение о присоединении к комнате после установки соединения
  useEffect(() => {
    if (isConnected && !joinMessageRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'join',
          room: chatId,
          username: session?.user?.name
        }));
        joinMessageRef.current = true;
      } catch (err) {
        console.error('Error sending join message:', err);
        setError('Ошибка при присоединении к чату');
      }
    }
  }, [isConnected, chatId, session?.user?.name]);

  useEffect(() => {
    // Прокрутка к последнему сообщению
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, socketMessages]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await onSendMessage(message);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'message',
          content: message,
          room: chatId,
          username: session?.user?.name
        }));
        console.log('Message sent via WebSocket');
      } else {
        console.error('WebSocket not connected');
        setError('Нет соединения с сервером. Попытка переподключения...');
        connectWebSocket();
      }

      setMessage('');
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      setError('Ошибка при отправке сообщения');
    }
  };

  const allMessages = [...messages, ...socketMessages];

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      {error && (
        <div className="p-2 bg-destructive text-destructive-foreground text-sm">
          {error}
        </div>
      )}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {allMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
                }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${msg.senderId === session?.user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                  }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {otherUserTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm">Печатает...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Введите сообщение..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!isConnected}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!isConnected}
          >
            {isConnected ? 'Отправить' : 'Подключение...'}
          </Button>
        </div>
      </div>
    </div>
  );
} 