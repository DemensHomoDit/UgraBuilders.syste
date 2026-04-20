
import React, { useRef } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageSelector from "./image-uploader/ImageSelector";
import ImagePreview from "./image-uploader/ImagePreview";
import { Progress } from "@/components/ui/progress";

export interface ImageUploaderProps {
  onImageUploaded?: (imageUrl: string) => void;
  imageUrl?: string;
  folderPath?: string;
  bucketName?: string;
  setIsUploading?: (isUploading: boolean) => void;
  aspectRatio?: number | string;
  className?: string;
  onError?: (error: string) => void;
}

/**
 * Компонент для загрузки изображений в Supabase Storage
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUploaded,
  imageUrl,
  folderPath = "",
  bucketName = "project-images-new",
  setIsUploading,
  aspectRatio = "16/9",
  className = "",
  onError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Используем хук для управления загрузкой изображений
  const {
    previewUrl,
    setPreviewUrl,
    uploading,
    uploadProgress,
    imageError,
    setImageError,
    uploadImage,
    retryLoadImage
  } = useImageUpload({
    bucketName,
    folderPath,
    onImageUploaded,
    onError,
    setIsUploading,
    initialImageUrl: imageUrl
  });

  // Обработчик выбора файла
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Загружаем файл
    const uploadedUrl = await uploadImage(file);
    
    // Если загрузка успешна, вызываем колбэк
    if (uploadedUrl) {
      onImageUploaded?.(uploadedUrl);
    }
    
    // Сбрасываем input для возможности повторной загрузки того же файла
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Обработчик клика по компоненту выбора файла
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  // Обработчик удаления изображения
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setImageError(false);
    onImageUploaded?.(''); // При удалении изображения передаем пустую строку
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
      />

      {!previewUrl ? (
        <ImageSelector 
          onSelect={handleSelectClick}
          isUploading={uploading}
          aspectRatio={aspectRatio}
        />
      ) : (
        <ImagePreview 
          imageUrl={previewUrl}
          onRemove={handleRemoveImage}
          onRetry={retryLoadImage}
          hasError={imageError}
          aspectRatio={aspectRatio}
        />
      )}
      
      {uploading && (
        <div className="w-full space-y-2">
          <Progress value={uploadProgress} className="h-2 w-full" />
          <p className="text-xs text-center text-muted-foreground">
            {uploadProgress < 100 
              ? `Загрузка: ${Math.round(uploadProgress)}%` 
              : "Обработка изображения..."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
