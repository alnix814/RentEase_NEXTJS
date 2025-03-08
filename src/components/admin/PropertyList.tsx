'use client';
import { useState, useEffect } from 'react';
import { Property } from '@prisma/client';

export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    async function fetchProperties() {
      const response = await fetch('/api/properties');
      const data = await response.json();
      setProperties(data);
    }
    fetchProperties();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить это свойство?')) {
      try {
        const response = await fetch(`/api/properties/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setProperties(properties.filter(p => p.id !== id));
        }
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl mb-4">Список свойств</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Название</th>
            <th className="border p-2">Адрес</th>
            <th className="border p-2">Цена</th>
            <th className="border p-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.id}>
              <td className="border p-2">{property.id}</td>
              <td className="border p-2">{property.name}</td>
              <td className="border p-2">{property.address}</td>
              <td className="border p-2">{property.price.toString()}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleDelete(property.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
