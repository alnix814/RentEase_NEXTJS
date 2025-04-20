'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const revenueData = [
  { name: 'Янв', value: 12400 },
  { name: 'Фев', value: 15600 },
  { name: 'Мар', value: 18200 },
  { name: 'Апр', value: 17100 },
  { name: 'Май', value: 19800 },
  { name: 'Июн', value: 25400 },
  { name: 'Июл', value: 28900 },
  { name: 'Авг', value: 27300 },
  { name: 'Сен', value: 24100 },
  { name: 'Окт', value: 21500 },
  { name: 'Ноя', value: 19700 },
  { name: 'Дек', value: 23800 },
];

const visitorsData = [
  { name: 'Янв', Новые: 340, Вернувшиеся: 200 },
  { name: 'Фев', Новые: 420, Вернувшиеся: 240 },
  { name: 'Мар', Новые: 510, Вернувшиеся: 280 },
  { name: 'Апр', Новые: 480, Вернувшиеся: 310 },
  { name: 'Май', Новые: 560, Вернувшиеся: 350 },
  { name: 'Июн', Новые: 690, Вернувшиеся: 410 },
  { name: 'Июл', Новые: 820, Вернувшиеся: 490 },
  { name: 'Авг', Новые: 780, Вернувшиеся: 510 },
  { name: 'Сен', Новые: 710, Вернувшиеся: 460 },
  { name: 'Окт', Новые: 640, Вернувшиеся: 420 },
  { name: 'Ноя', Новые: 580, Вернувшиеся: 390 },
  { name: 'Дек', Новые: 690, Вернувшиеся: 430 },
];

const propertiesData = [
  { name: 'Квартиры', value: 65 },
  { name: 'Дома', value: 25 },
  { name: 'Виллы', value: 10 },
];

const bookingsData = [
  { name: 'Янв', value: 42 },
  { name: 'Фев', value: 55 },
  { name: 'Мар', value: 67 },
  { name: 'Апр', value: 61 },
  { name: 'Май', value: 74 },
  { name: 'Июн', value: 93 },
  { name: 'Июл', value: 108 },
  { name: 'Авг', value: 102 },
  { name: 'Сен', value: 89 },
  { name: 'Окт', value: 76 },
  { name: 'Ноя', value: 68 },
  { name: 'Дек', value: 82 },
];

const locationData = [
  { name: 'Москва', value: 35 },
  { name: 'Санкт-Петербург', value: 25 },
  { name: 'Сочи', value: 15 },
  { name: 'Казань', value: 10 },
  { name: 'Новосибирск', value: 8 },
  { name: 'Другие', value: 7 },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', '#8884d8'];

export default function StatisticsPage() {
  const [period, setPeriod] = useState('year');

  return (
    <div className="container mx-auto px-4 pb-4 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Аналитика</h1>
          <p className="text-muted-foreground mt-1">Полный обзор статистики по вашей недвижимости</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Выберите период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Последний месяц</SelectItem>
              <SelectItem value="quarter">Последний квартал</SelectItem>
              <SelectItem value="year">Последний год</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₽2,450,000</div>
            <p className="text-xs text-muted-foreground mt-1">+12.5% с прошлого периода</p>
            <div className="h-[80px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData.slice(-6)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего бронирований</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">832</div>
            <p className="text-xs text-muted-foreground mt-1">+8.2% с прошлого периода</p>
            <div className="h-[80px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingsData.slice(-6)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Объектов недвижимости</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground mt-1">+5.8% с прошлого периода</p>
            <div className="h-[80px] mt-4 flex justify-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={propertiesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={35}
                    dataKey="value"
                  >
                    {propertiesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Средняя заполняемость</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground mt-1">+2.1% с прошлого периода</p>
            <div className="h-[80px] mt-4 flex justify-center items-center">
              <div className="w-16 h-16 rounded-full border-8 border-[hsl(var(--chart-3))] relative flex items-center justify-center">
                <span className="text-sm font-bold">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Доход по месяцам</CardTitle>
            <CardDescription>
              Динамика дохода за последние 12 месяцев
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₽${value.toLocaleString()}`, 'Доход']}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Количество посетителей</CardTitle>
            <CardDescription>
              Новые и вернувшиеся посетители
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitorsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Новые" stroke="hsl(var(--chart-2))" strokeWidth={2} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Вернувшиеся" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Бронирования по месяцам</CardTitle>
            <CardDescription>
              Количество бронирований по месяцам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Популярные локации</CardTitle>
            <CardDescription>
              Распределение по городам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Подробная аналитика</CardTitle>
          <CardDescription>
            Расширенные данные по различным аспектам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="revenue">Доход</TabsTrigger>
              <TabsTrigger value="bookings">Бронирования</TabsTrigger>
              <TabsTrigger value="visitors">Посещаемость</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₽${value.toLocaleString()}`, 'Доход']} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} activeDot={{ r: 8 }} name="Доход" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="bookings">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="hsl(var(--chart-2))" name="Бронирования" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="visitors">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visitorsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Новые" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    <Line type="monotone" dataKey="Вернувшиеся" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 