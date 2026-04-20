
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/integrations/db/client";

const imageUnavailableSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23475569' font-size='28'%3EImage unavailable%3C/text%3E%3C/svg%3E";

// Интерфейс для элемента галереи
interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  city?: string;
  description?: string;
  construction_year?: number;
}

const ProjectCarousel = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const navigate = useNavigate();

  // Загрузка фотографий реализованных проектов
  const loadGalleryItems = async () => {
    try {
      const { data, error } = await db
        .from("gallery_items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
        
      if (error) {
        throw error;
      }
      
      setGalleryItems(data || []);
    } catch (error: any) {
      console.error("Ошибка при загрузке галереи:", error);
    }
  };

  useEffect(() => {
    loadGalleryItems();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadGalleryItems();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleGalleryItemClick = () => {
    navigate('/projects/gallery');
  };

  if (galleryItems.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto py-12">
      <h3 className="text-2xl font-bold text-center mb-8">Фото построенных домов</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {galleryItems.slice(0, 8).map((item) => (
          <div 
            key={item.id} 
            className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer group"
            onClick={handleGalleryItemClick}
          >
            <div className="relative h-48 md:h-56 w-full overflow-hidden">
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = imageUnavailableSvg;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-sm font-medium">{item.title}</p>
                {item.city && <p className="text-xs">{item.city}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <button 
          onClick={handleGalleryItemClick}
          className="inline-flex items-center text-primary hover:text-primary/70 text-sm font-medium transition-colors"
        >
          Смотреть все фото
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProjectCarousel;
