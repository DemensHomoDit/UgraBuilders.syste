
import { useState, useEffect, useCallback } from "react";
import { supabaseStorage } from "@/utils/supabaseStorage";

interface UseImageUploadProps {
  bucketName: string;
  folderPath?: string;
  onImageUploaded?: (url: string) => void;
  onError?: (error: string) => void;
  setIsUploading?: (isUploading: boolean) => void;
  initialImageUrl?: string;
}

export const useImageUpload = ({
  bucketName,
  folderPath = "",
  onImageUploaded,
  onError,
  setIsUploading,
  initialImageUrl = ""
}: UseImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Устанавливаем начальное изображение, если оно передано через props
  useEffect(() => {
    if (initialImageUrl && initialImageUrl !== previewUrl) {
      setPreviewUrl(initialImageUrl);
      setImageError(false);
    }
  }, [initialImageUrl]);

  // Функция для создания контролируемого прогресса загрузки
  const mockProgress = useCallback(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 5;
      if (progress > 95) {
        progress = 95;
        clearInterval(interval);
      }
      setUploadProgress(progress);
    }, 100);
    return interval;
  }, []);

  // Функция для загрузки изображения
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    try {
      setUploading(true);
      setUploadProgress(0);
      setImageError(false);
      
      if (setIsUploading) setIsUploading(true);
      
      // Сразу создаем локальный URL для превью
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Запускаем имитацию прогресса
      const progressInterval = mockProgress();
      
      // Загружаем файл в хранилище
      const imageUrl = await supabaseStorage.uploadFile(file, bucketName, folderPath);
      
      // Остановка имитации прогресса
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!imageUrl) {
        throw new Error("Не удалось получить URL загруженного изображения");
      }
      // Отчищаем старый объектный URL, чтобы избежать утечек памяти
      URL.revokeObjectURL(objectUrl);
      
      // Устанавливаем URL загруженного изображения
      setPreviewUrl(imageUrl);
      
      // Вызываем колбэк с URL изображения
      if (onImageUploaded) {
        onImageUploaded(imageUrl);
      }
      
      return imageUrl;
    } catch (error: any) {
      console.error("Ошибка загрузки изображения:", error);
      setImageError(true);
      
      if (onError) {
        onError(error.message || "Ошибка загрузки изображения");
      }
      
      return null;
    } finally {
      setUploading(false);
      if (setIsUploading) setIsUploading(false);
    }
  }, [bucketName, folderPath, mockProgress, onImageUploaded, onError, setIsUploading]);

  // Функция для перезагрузки изображения при ошибке
  const retryLoadImage = useCallback(() => {
    if (previewUrl) {
      setImageError(false);
      // Загружаем изображение заново
      const img = new Image();
      img.src = previewUrl;
      img.onload = () => setImageError(false);
      img.onerror = () => setImageError(true);
    }
  }, [previewUrl]);

  return {
    previewUrl,
    setPreviewUrl,
    uploading,
    uploadProgress,
    imageError,
    setImageError,
    uploadImage,
    retryLoadImage
  };
};
