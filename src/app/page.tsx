'use client';

import { Button } from "@/components/ui/button";
import { CardDemo } from "@/components/ui/rent-card";
import { useState, useEffect } from "react";
import { Property, PropertyImage } from "@prisma/client";

// Тип для свойства с изображениями
type PropertyWithImages = Property & { 
  PropertyImage: PropertyImage[] 
};

export default function Home() {
  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadItems = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const itemsPerPage = 10;
      const response = await fetch(`/api/properties?page=${page}&limit=${itemsPerPage}`);
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные');
      }

      const result = await response.json();

      if (result.length < itemsPerPage) {
        setHasMore(false);
      }

      // Если это первая страница, заменяем список, иначе добавляем
      setProperties(prev => 
        page === 1 ? result : [...prev, ...result]
      );

      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      // Можно добавить toast или другое уведомление об ошибке
    } finally {
      setLoading(false);
    }
  };

  // Загрузка первоначальных данных
  useEffect(() => {
    loadItems();
  }, []);

  return (
    <section className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="mx-auto w-full max-w-[1920px]">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-4 sm:gap-y-6 md:gap-y-8">
          {properties.map((property) => (
            <div key={property.id} className="w-full flex justify-center">
              <div className="w-full">
                <CardDemo
                  imageSrc={property.PropertyImage.map(img => img.url)}
                  country={property.country}
                  settlement={property.settlement}
                  rate={property.rate}
                  name={property.name}
                  address={property.address}
                  price={property.price}
                />
              </div>
            </div>
          ))}
        </div>
        
        {hasMore && (
          <div className="flex justify-center mt-6">
            <Button 
              onClick={loadItems} 
              disabled={loading}
            >
              {loading ? 'Загрузка...' : 'Загрузить еще'}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
