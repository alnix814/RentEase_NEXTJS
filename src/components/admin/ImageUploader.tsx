'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export default function ImageUploader() {
  const [images, setImages] = useState<string[]>([]);
  const [propertyId, setPropertyId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newimagePreview, setNewImagePreview] = useState<string | null>(null);

  const handleUpload = useCallback((result: CloudinaryUploadWidgetResults) => {

    if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
      const imageUrl = (result.info as { secure_url: string }).secure_url;

      const uploadImage = async () => {
        try {
          const response = await fetch('/api/property-images', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              propertyId: propertyId,
              url: imageUrl,
            })
          });

          const responseData = await response.json();

          if (response.ok) {
            setImages(prevImages => [...prevImages, imageUrl]);
            setError(null);
          } else {
            setError(responseData.message || 'Ошибка при загрузке');
          }
        } catch (error) {
          console.error('Ошибка загрузки:', error);
          setError('Произошла ошибка при загрузке');
        }
      };

      uploadImage();
    }
  }, [propertyId]);

  const handleImagesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };

      const res = await fetch('/api/property-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId: propertyId,
          url: imagePreview,
        })
      })

      const mess = await res.json();

      if (res.ok) {
        alert(`Наконец то ${mess.url}`)
        setNewImagePreview(mess.url);
      } else {
        alert(mess.message);
      }
    }

  }

  return (
    <div>
      {error && (
        <div className="text-red-500 mb-3">
          {error}
        </div>
      )}

      <div className='mb-3 w-[500px]'>
        ID записи в базе данных
        <Input
          type="text"
          onChange={(e) => setPropertyId(e.target.value)}
          value={propertyId}
          placeholder="Введите ID свойства"
        />
      </div>

      <div>
        <label className='bg-blue-200 rounded-lg p-2'>
          Загрузить
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImagesChange}
          />
        </label>

      </div>

      <div className='border border-black rounded-lg w-[400px] mt-4'>
        Предпросмотр загруженного изображения:
        <Image className='mt-4 rounded-lg' src={imagePreview || '/img.png'} alt='' height={200} width={200}></Image>
      </div>

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
