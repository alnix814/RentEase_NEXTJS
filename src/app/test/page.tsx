'use client'

import { useEffect, useRef, useState } from 'react'; 

const Home = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        wsRef.current = new WebSocket('ws://localhost:3001');

        wsRef.current.onmessage = (e) => {
            setMessages((prev) => [...prev, e.data]);
        };

        return () => {
            wsRef.current?.close();
        };
    }, []);

    const sendMessage = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(input);
            setInput('');
        }
    };

    return (
        <div>
            <ul>
                {messages.map((msg, i) => (
                    <li key={i}>{msg}</li>
                ))}
            </ul>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Home;