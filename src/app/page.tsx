'use client';

import { CardDemo } from "@/components/ui/rent-card";
import { useState, useEffect, useCallback } from "react";
import { Property, PropertyImage } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

type PropertyWithImages = Property & {
  PropertyImage: PropertyImage[]
};

export default function Home() {
  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadItems = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const itemsPerPage = 15;
      const response = await fetch(`/api/properties?page=${page}&limit=${itemsPerPage}`, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Не удалось загрузить данные');
      }

      const result = await response.json();

      setHasMore(result.hasMore);

      setProperties(prev => page === 1 ? result.properties : [...prev, ...result.properties]);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      const bottom = window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight;
      if (bottom && hasMore && !loading) {
        loadItems();
      }
    };

    window.addEventListener('scroll', handleScroll);

    loadItems();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadItems, hasMore, loading]);

  return (
    <section className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="mx-auto w-full max-w-[1920px]">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-4 sm:gap-y-6 md:gap-y-8">
          {loading ? (
            Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="w-full flex justify-center">
                <div className="w-full">
                  <Skeleton className="h-64 mb-4" />
                  <Skeleton className="h-6 mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))
          ) : (
            properties.map((property) => (
              <div key={property.id} className="w-full flex justify-center">
                <div className="w-full">
                  <CardDemo
                    id={property.id}
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
            ))
          )}
        </div>
      </div>
    </section>
  );
}
