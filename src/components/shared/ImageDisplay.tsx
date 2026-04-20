
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

interface ImageDisplayProps {
  imageUrl: string;
  alt?: string;
  aspectRatio?: string | number; // например "16/9", "4/3", "1/1" или 1.78
  className?: string;
  onError?: () => void;
}

/**
 * Компонент для отображения изображения с обработкой ошибок и фиксированным соотношением сторон
 */
const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageUrl,
  alt = "Изображение",
  aspectRatio = "16/9",
  className = "",
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    // Уведомляем родительский компонент об ошибке
    if (onError) {
      onError();
    }
    
    console.error(`Ошибка загрузки изображения: ${imageUrl}`);
  };

  // Рассчитываем правильный класс aspect-ratio
  const getAspectRatioClass = (ratio: string | number) => {
    // Поддерживаем как строковый формат (16/9), так и числовой (1.78)
    if (typeof ratio === 'string' && ratio.includes('/')) {
      // Парсим формат "16/9"
      const [w, h] = ratio.split('/').map(Number);
      if (!isNaN(w) && !isNaN(h) && h !== 0) {
        return `aspect-[${w}/${h}]`;
      }
    } 
    
    // Для числового формата (1.78) или некорректной строки используем напрямую
    return `aspect-[${ratio}]`;
  };

  const aspectRatioClass = getAspectRatioClass(aspectRatio);

  return (
    <div className={cn(
      aspectRatioClass,
      "relative overflow-hidden bg-muted",
      className
    )}>
      {/* Отображаем placeholder во время загрузки */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-primary/50 border-t-primary animate-spin"></div>
        </div>
      )}
      
      {/* Отображаем ошибку, если изображение не загрузилось */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
          <ImageOff className="w-8 h-8 text-muted-foreground/50 mb-2" />
          <div className="text-xs text-muted-foreground">Ошибка загрузки</div>
        </div>
      )}
      
      {/* Само изображение (скрыто при ошибке) */}
      {!hasError && (
        <img
          src={imageUrl}
          alt={alt}
          className={cn(
            "w-full h-full object-cover",
            isLoading ? "opacity-0" : "opacity-100",
            "transition-opacity duration-300"
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default ImageDisplay;
