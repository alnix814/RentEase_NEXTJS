'use client';
import PropertyList from '@/components/admin/PropertyList';
import { Button } from '@/components/ui/button';
import { Toast_Custom } from '@/components/ui/toast_custom';
import { useSession } from 'next-auth/react';
import { useState } from 'react';



export default function AdminDashboard() {

  const [info, setInfo] = useState<string>('');
  const session = useSession();

  async function post_property() {
    const res = await fetch('/api/add_photos', {
      method: 'POST'
    })

    const unres = await res.json();

    if (!res.ok) {
      setInfo(`Не сработало ${unres.message}`);
    } else {
      setInfo(`Cработало ${unres.message}`);
    }
  }

  const test = async () => {
    const response = await fetch('/api/fetchComments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: "2e1c596c-cbc6-413d-9d17-9117cbaabb64",
        propertyId: "b418d871-810e-4051-aaba-9a777db9777f",
        content: "commentuser",
        createdAt: new Date(), // Используем new Date() для корректной даты
      }),
    })

    const data = await response.json();

    Toast_Custom({ errormessage: data.error || 'Всенорм вроде', setError: () => { }, type: 'error' });
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Панель администратора</h1>
      <div className='w-full flex items-center justify-center p-16'>
        <button onClick={() => post_property()} className="relative overflow-hidden bg-white p-2 rounded-lg transition-all duration-300 ease-in-out group">
          <span className="relative z-10 text-white font-medium">Волшебная кнопка</span>
          <div className="absolute inset-0 bg-gradient-to-t from-sky-500 to-indigo-500 transition-opacity duration-300 ease-in-out opacity-100" />
        </button>

        <Button onClick={() => test()}>Тест</Button>
        <p>{session.data?.user.id}</p>

        <p>{info}</p>
      </div>


      <PropertyList />
    </div>
  );
}
