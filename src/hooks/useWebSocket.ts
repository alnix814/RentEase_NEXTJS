// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url: string) => {
    const [messages, setMessages] = useState<string[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Создаём подключение
        socketRef.current = new WebSocket(url);

        // Обработчик входящих сообщений
        socketRef.current.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data]);
        };

        // Обработчик закрытия соединения
        socketRef.current.onclose = () => {
            console.log('WebSocket disconnected');
        };

        // Очистка при размонтировании
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [url]);

    // Функция отправки сообщения
    const sendMessage = (message: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(message);
        }
    };

    return { messages, sendMessage };
};