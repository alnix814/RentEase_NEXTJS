'use client';
import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useDrop } from "react-dnd";

export default function ImageUploader() {
  const [images, setImages] = useState<string[]>([]);
  const [propertyId, setPropertyId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const dropRef = useRef<HTMLDivElement | null>(null);


  const handleImagesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };

      setLoading(true);

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
        setLoading(false);
        alert(mess.message)
      } else {
        setLoading(false);
        alert(mess.message + '\n' + mess.error.message);
      }
    }

  }

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'ITEM',
    drop: (item) => console.log('Dropped item:', item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

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
          {loading ? (
            'Загрузка...'
          ) : (
            'Загрузить'
          )}
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImagesChange}
          />

        </label>

        <div
          className={
            isOver ? 
            'bg-green-400 w-64 h-64 my-4 flex items-center justify-center border border-blue-500' 
            : 
            'bg-blue-200 w-64 h-64 my-4 flex items-center justify-center border border-blue-500'
          }
          ref={(node) => {
            drop(node);
            dropRef.current = node;
          }}>
          Либо перетащи сюда
        </div>

      </div>

      <div className='border border-black rounded-lg mt-4'>
        Предпросмотр загруженного изображения:
        <Image className='mt-4 rounded-lg' src={imagePreview || '/img.png'} alt='' height={800} width={800}></Image>
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
