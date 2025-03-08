'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PropertyForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    price: '',
    settlement: '',
    country: '',
    rate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          rate: parseFloat(formData.rate)
        })
      });

      if (response.ok) {
        alert('Свойство успешно добавлено');
        router.refresh();
        // Сбросить форму
        setFormData({
          name: '',
          address: '',
          price: '',
          settlement: '',
          country: '',
          rate: ''
        });
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось добавить свойство');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
      <h2 className="text-2xl mb-4">Добавить свойство</h2>
      {Object.keys(formData).map((key) => (
        <div key={key} className="mb-4">
          <label className="block mb-2">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
          <input
            type={key === 'price' || key === 'rate' ? 'number' : 'text'}
            name={key}
            value={formData[key as keyof typeof formData]}
            onChange={(e) => setFormData({...formData, [key]: e.target.value})}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
      ))}
      <button 
        type="submit" 
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Добавить свойство
      </button>
    </form>
  );
}
