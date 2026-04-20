
import React from "react";
import { cn } from "@/lib/utils";
import { ImageOff, X, ChevronLeft, ChevronRight } from "lucide-react";
import ImageDisplay from "./ImageDisplay";
import { Button } from "@/components/ui/button";

// Интерфейс для единственного изображения
interface ImageViewerProps {
  imageUrl: string;
  alt?: string;
  className?: string;
  aspectRatio?: string | number;
}

// Интерфейс для галереи изображений
interface GalleryProps {
  images: Array<{ id: string; image_url: string; description?: string | null }>;
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

/**
 * Компонент для отображения изображений с обработкой ошибок
 * Поддерживает как одиночные изображения, так и галерею
 */
const ImageViewer = (props: ImageViewerProps | GalleryProps) => {
  // Проверяем, является ли это просмотром галереи
  const isGallery = 'images' in props;

  // Если это не галерея, используем старую логику для одиночного изображения
  if (!isGallery) {
    const { imageUrl, alt = "Изображение", className = "", aspectRatio = "16/9" } = props;

    if (!imageUrl) {
      return (
        <div className={cn(
          "flex flex-col items-center justify-center bg-muted",
          className
        )}>
          <ImageOff className="w-8 h-8 text-muted-foreground/50 mb-2" />
          <div className="text-xs text-muted-foreground">Нет изображения</div>
        </div>
      );
    }

    return (
      <ImageDisplay
        imageUrl={imageUrl}
        alt={alt || "Изображение"}
        aspectRatio={aspectRatio}
        className={className}
      />
    );
  }

  // Логика для галереи изображений
  const { images, currentIndex, isOpen, onClose, onNext, onPrevious } = props;

  // Если галерея закрыта, не отображаем ничего
  if (!isOpen) return null;

  // Получаем текущее изображение
  const currentImage = images[currentIndex];
  
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
      {/* Кнопка закрытия - исправлена, теперь использует обычный Button компонент */}
      <Button 
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 rounded-full bg-black/40 text-white hover:bg-black/60"
        aria-label="Закрыть"
      >
        <X size={24} />
      </Button>
      
      {/* Контейнер для изображения */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10">
        {/* Изображение */}
        {currentImage && (
          <div className="relative w-full max-w-4xl max-h-[80vh]">
            <img
              src={currentImage.image_url}
              alt={currentImage.description || "Изображение проекта"}
              className="object-contain w-full h-full max-h-[80vh]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-muted/20">
              <ImageOff className="w-12 h-12 text-white/70 mb-2" />
              <div className="text-sm text-white/70">Не удалось загрузить изображение</div>
            </div>
          </div>
        )}
        
        {/* Кнопки навигации */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="absolute left-4 md:left-8 rounded-full bg-black/40 text-white hover:bg-black/60 disabled:opacity-30"
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft size={24} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 md:right-8 rounded-full bg-black/40 text-white hover:bg-black/60 disabled:opacity-30"
              aria-label="Следующее изображение"
            >
              <ChevronRight size={24} />
            </Button>
          </>
        )}
      </div>
      
      {/* Счетчик изображений */}
      {images.length > 1 && (
        <div className="absolute bottom-4 text-white/80 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
      
      {/* Описание изображения, если оно есть */}
      {currentImage && currentImage.description && (
        <div className="absolute bottom-10 bg-black/50 p-2 px-4 rounded-md max-w-md text-center">
          <p className="text-white/90 text-sm">{currentImage.description}</p>
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
