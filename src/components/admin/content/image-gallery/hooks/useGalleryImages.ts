
import { useState, useEffect, useRef, useCallback } from "react";
import { ProjectImage } from "@/services/project/types";
import { toast } from "sonner";

interface UseGalleryImagesProps {
  projectId: string;
  images: ProjectImage[];
  onImageAdd: (image: ProjectImage) => Promise<void>;
  onImageUpdate: (imageId: string, data: Partial<ProjectImage>) => Promise<void>;
  onImageDelete: (imageId: string) => Promise<boolean>;
  onImagesReorder?: (reorderedImages: ProjectImage[]) => Promise<void>;
}

const useGalleryImages = ({
  projectId,
  images,
  onImageAdd,
  onImageUpdate,
  onImageDelete,
  onImagesReorder
}: UseGalleryImagesProps) => {
  const [localImages, setLocalImages] = useState<ProjectImage[]>(images);
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);

  // Обновляем локальные изображения при изменении props
  useEffect(() => {
    if (isMounted.current) {
      setLocalImages(images);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [images]);

  // Безопасная установка состояния
  const safeSetState = useCallback(<T extends unknown>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    value: React.SetStateAction<T>
  ) => {
    if (isMounted.current) {
      setter(value);
    }
  }, []);

  // Обработчик добавления изображения
  const handleImageAdd = useCallback(async (image: ProjectImage): Promise<void> => {
    if (!projectId) {
      toast.error("ID проекта не указан");
      return Promise.reject(new Error("ID проекта не указан"));
    }
    
    try {
      safeSetState(setIsLoading, true);
      
      // Добавляем изображение
      await onImageAdd(image);
      
      // Обновляем локальный список изображений только если компонент смонтирован
      if (isMounted.current) {
        safeSetState(setLocalImages, prev => [...prev, image]);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Ошибка при добавлении изображения:", error);
      return Promise.reject(error);
    } finally {
      if (isMounted.current) {
        safeSetState(setIsLoading, false);
      }
    }
  }, [projectId, onImageAdd, safeSetState]);

  // Обработчик сохранения описания
  const handleSaveDescription = useCallback(async (imageId: string, description: string): Promise<void> => {
    try {
      safeSetState(setIsLoading, true);
      
      // Обновляем описание изображения
      await onImageUpdate(imageId, { description });
      
      // Обновляем локальный список изображений только если компонент смонтирован
      if (isMounted.current) {
        safeSetState(setLocalImages, prev => 
          prev.map(img => img.id === imageId ? { ...img, description } : img)
        );
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Ошибка при обновлении описания:", error);
      return Promise.reject(error);
    } finally {
      if (isMounted.current) {
        safeSetState(setIsLoading, false);
      }
    }
  }, [onImageUpdate, safeSetState]);

  // Обработчик удаления изображения
  const handleDeleteImage = useCallback(async (imageId: string): Promise<boolean> => {
    try {
      safeSetState(setIsLoading, true);
      
      // Удаляем изображение
      const success = await onImageDelete(imageId);
      
      // Обновляем локальный список изображений только если компонент смонтирован
      if (success && isMounted.current) {
        safeSetState(setLocalImages, prev => prev.filter(img => img.id !== imageId));
      }
      
      return success;
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
      return false;
    } finally {
      if (isMounted.current) {
        safeSetState(setIsLoading, false);
      }
    }
  }, [onImageDelete, safeSetState]);

  // Обработчик перемещения изображения вверх
  const handleMoveUp = useCallback(async (image: ProjectImage): Promise<void> => {
    const currentIndex = localImages.findIndex(img => img.id === image.id);
    if (currentIndex <= 0 || !onImagesReorder) return Promise.resolve();
    
    try {
      safeSetState(setIsLoading, true);
      
      // Создаем новый массив изображений с измененным порядком
      const newImages = [...localImages];
      [newImages[currentIndex - 1], newImages[currentIndex]] = 
        [newImages[currentIndex], newImages[currentIndex - 1]];
      
      // Обновляем локальный список изображений
      if (isMounted.current) {
        safeSetState(setLocalImages, newImages);
      }
      
      // Обновляем порядок изображений на сервере
      await onImagesReorder(newImages);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Ошибка при перемещении изображения вверх:", error);
      
      // Откатываем изменения в случае ошибки
      if (isMounted.current) {
        safeSetState(setLocalImages, localImages);
      }
      
      return Promise.reject(error);
    } finally {
      if (isMounted.current) {
        safeSetState(setIsLoading, false);
      }
    }
  }, [localImages, onImagesReorder, safeSetState]);

  // Обработчик перемещения изображения вниз
  const handleMoveDown = useCallback(async (image: ProjectImage): Promise<void> => {
    const currentIndex = localImages.findIndex(img => img.id === image.id);
    if (currentIndex < 0 || currentIndex >= localImages.length - 1 || !onImagesReorder) {
      return Promise.resolve();
    }
    
    try {
      safeSetState(setIsLoading, true);
      
      // Создаем новый массив изображений с измененным порядком
      const newImages = [...localImages];
      [newImages[currentIndex], newImages[currentIndex + 1]] = 
        [newImages[currentIndex + 1], newImages[currentIndex]];
      
      // Обновляем локальный список изображений
      if (isMounted.current) {
        safeSetState(setLocalImages, newImages);
      }
      
      // Обновляем порядок изображений на сервере
      await onImagesReorder(newImages);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Ошибка при перемещении изображения вниз:", error);
      
      // Откатываем изменения в случае ошибки
      if (isMounted.current) {
        safeSetState(setLocalImages, localImages);
      }
      
      return Promise.reject(error);
    } finally {
      if (isMounted.current) {
        safeSetState(setIsLoading, false);
      }
    }
  }, [localImages, onImagesReorder, safeSetState]);

  return {
    localImages,
    isLoading,
    handleImageAdd,
    handleSaveDescription,
    handleDeleteImage,
    handleMoveUp,
    handleMoveDown
  };
};

export default useGalleryImages;
