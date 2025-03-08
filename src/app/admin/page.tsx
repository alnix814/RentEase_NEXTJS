'use client';
import { useState } from 'react';
import PropertyForm from '@/components/admin/PropertyForm';
import PropertyList from '@/components/admin/PropertyList';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'properties' | 'images'>('properties');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Панель администратора</h1>
      
      <div className="flex mb-4">
        <button 
          onClick={() => setActiveTab('properties')}
          className={`mr-4 px-4 py-2 ${activeTab === 'properties' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Свойства
        </button>
        <button 
          onClick={() => setActiveTab('images')}
          className={`px-4 py-2 ${activeTab === 'images' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Изображения
        </button>
      </div>

      {activeTab === 'properties' && (
        <div>
          <PropertyForm />
          <PropertyList />
        </div>
      )}

      {activeTab === 'images' && (
        <ImageUploader />
      )}
    </div>
  );
}
