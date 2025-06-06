'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Calendar, MapPin, Home, User } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Toast_Custom } from '@/components/ui/toast_custom';
import { ChatWindow } from '@/components/chat/ChatWindow';

interface Rental {
  id: string;
  property: {
    id: string;
    name: string;
    address: string;
    price: number;
    PropertyImage: { url: string }[];
  };
  startDate: Date;
  endDate: Date;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

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

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await fetch('/api/rentals');
        if (!response.ok) throw new Error('Failed to fetch rentals');
        const data = await response.json();
        setRentals(data);
      } catch (error) {
        console.error('Error fetching rentals:', error);
        Toast_Custom({ errormessage: 'Ошибка при загрузке аренд', setError: () => {} });
      }
    };

    fetchRentals();
  }, []);

  useEffect(() => {
    if (selectedRental) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/messages?rentalId=${selectedRental.id}`);
          if (!response.ok) throw new Error('Failed to fetch messages');
          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error('Error fetching messages:', error);
          Toast_Custom({ errormessage: 'Ошибка при загрузке сообщений', setError: () => {} });
        }
      };

      fetchMessages();
    }
  }, [selectedRental]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !selectedRental) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalId: selectedRental.id,
          content: content,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      Toast_Custom({ errormessage: 'Ошибка при отправке сообщения', setError: () => {} });
    } finally {
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Мои аренды</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список аренд */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Арендованные помещения</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {rentals.map((rental) => (
                  <div
                    key={rental.id}
                    className={`p-4 border rounded-lg mb-4 cursor-pointer hover:bg-gray-50 ${
                      selectedRental?.id === rental.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedRental(rental)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={rental.property.PropertyImage[0]?.url} />
                        <AvatarFallback>
                          <Home className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{rental.property.name}</h3>
                        <p className="text-sm text-gray-500">{rental.property.address}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(rental.startDate), 'd MMMM', { locale: ru })} -{' '}
                        {format(new Date(rental.endDate), 'd MMMM', { locale: ru })}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{rental.property.address}</span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Чат и детали аренды */}
        <div className="lg:col-span-2">
          {selectedRental ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={selectedRental.user.image || ''} />
                      <AvatarFallback>
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedRental.user.name}</h3>
                      <p className="text-sm text-gray-500">{selectedRental.user.email}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Статус: {selectedRental.status}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="chat">
                  <TabsList className="mb-4">
                    <TabsTrigger value="chat" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Чат
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Детали аренды
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat">
                    <ChatWindow chatId={selectedRental.id} messages={messages} onSendMessage={handleSendMessage}/>
                  </TabsContent>

                  <TabsContent value="details">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Информация о помещении</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Название</p>
                            <p>{selectedRental.property.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Адрес</p>
                            <p>{selectedRental.property.address}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Стоимость</p>
                            <p>{selectedRental.property.price} ₽/сутки</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Период аренды</p>
                            <p>
                              {format(new Date(selectedRental.startDate), 'd MMMM yyyy', { locale: ru })} -{' '}
                              {format(new Date(selectedRental.endDate), 'd MMMM yyyy', { locale: ru })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[600px]">
                <p className="text-gray-500">Выберите аренду для просмотра деталей</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}