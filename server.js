const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ 
  server,
  clientTracking: true,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024
  }
});

// Хранение клиентов и их комнат
const clients = new Map();

// Heartbeat интервал (30 секунд)
const HEARTBEAT_INTERVAL = 30000;

// Обработка подключения нового клиента
wss.on('connection', (ws, req) => {
  console.log('New client connected');
  
  // Установка таймера для heartbeat
  const heartbeatInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, HEARTBEAT_INTERVAL);

  // Обработка pong сообщения
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Обработка получения сообщения от клиента
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join':
          // Добавление клиента в комнату
          if (!clients.has(data.room)) {
            clients.set(data.room, new Set());
          }
          clients.get(data.room).add(ws);
          ws.room = data.room;
          ws.username = data.username;

          // Уведомление всех участников комнаты о новом подключении
          const joinMessage = `${data.username} присоединился к комнате ${data.room}`;
          broadcastToRoom(data.room, {
            type: 'notification',
            content: joinMessage
          }, ws);
          console.log(`Client joined room: ${data.room}`);
          break;

        case 'message':
          if (ws.room) {
            // Отправка сообщения всем клиентам в комнате
            broadcastToRoom(ws.room, {
              type: 'message',
              content: data.content,
              username: ws.username,
              senderId: data.senderId
            }, ws);
          }
          break;

        case 'leave':
          if (ws.room) {
            handleClientLeave(ws);
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        content: 'Ошибка обработки сообщения'
      }));
    }
  });

  // Обработка отключения клиента
  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(heartbeatInterval);
    if (ws.room) {
      handleClientLeave(ws);
    }
  });

  // Обработка ошибок
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    if (ws.room) {
      handleClientLeave(ws);
    }
  });
});

// Функция для отправки сообщения всем клиентам в комнате, кроме отправителя
function broadcastToRoom(room, message, excludeWs = null) {
  if (clients.has(room)) {
    clients.get(room).forEach(client => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

// Функция для обработки выхода клиента из комнаты
function handleClientLeave(ws) {
  if (clients.has(ws.room)) {
    clients.get(ws.room).delete(ws);
    
    // Уведомление всех участников комнаты о выходе пользователя
    const leaveMessage = `${ws.username} покинул комнату ${ws.room}`;
    broadcastToRoom(ws.room, {
      type: 'notification',
      content: leaveMessage
    });

    // Удаление комнаты, если она пуста
    if (clients.get(ws.room).size === 0) {
      clients.delete(ws.room);
    }
    
    console.log(`Client left room: ${ws.room}`);
  }
}

// Очистка при завершении работы сервера
wss.on('close', () => {
  clearInterval(interval);
});

// Запуск сервера на порту 3001
server.listen(3001, () => {
  console.log('Server is listening on port 3001');
});