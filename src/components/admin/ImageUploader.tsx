'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Input } from '@/components/ui/input';

export default function ImageUploader() {
  const [images, setImages] = useState<string[]>([]);
  const [propertyId, setPropertyId] = useState<string>('');

  const handleUpload = async (result: any) => {
    const imageUrl = result.info.secure_url;
    
    try {
      const response = await fetch('/api/property-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ propertyId: propertyId, url: imageUrl })
      });

      const responseText = await response.json();

      if (response.ok) {
        alert(responseText.message);
        setImages(prevImages => [...prevImages, imageUrl]);
      } else {
        alert(responseText.message);
      }
    } catch (error) {
      alert('Произошла ошибка при загрузке');
      console.error('Ошибка загрузки:', error);
    }
  };

  return (
    <div>
      <div className='mb-3 w-[500px]'>
        ID записи в базе данных
        <Input 
          onChange={(e) => setPropertyId(e.target.value)} 
          value={propertyId}
        />
      </div>
      <CldUploadWidget 
        uploadPreset="ml_default" 
        onSuccess={handleUpload}
      >
        {({ open }) => (
          <button 
            onClick={() => open()} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Загрузить изображение
          </button>
        )}
      </CldUploadWidget>

      <div className="mt-4 grid grid-cols-4 gap-4">
        {images.map((url, index) => (
          <img 
            key={index} 
            src={url} 
            alt={`Uploaded ${index}`} 
            className="w-full h-40 object-cover"
          />
        ))}
      </div>
    </div>
  );
}
