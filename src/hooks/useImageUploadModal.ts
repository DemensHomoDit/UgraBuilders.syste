
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseImageUploadModalOptions {
  onImageSelected?: (url: string) => void;
  onModalClose?: () => void;
}

export function useImageUploadModal({
  onImageSelected,
  onModalClose
}: UseImageUploadModalOptions = {}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Открытие модального окна
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Закрытие модального окна
  const closeModal = useCallback(() => {
    if (isUploading) {
      toast.info("Дождитесь завершения загрузки", {
        description: "Нельзя закрыть во время загрузки"
      });
      return;
    }
    
    setIsModalOpen(false);
    setSelectedImageUrl('');
    
    if (onModalClose) {
      onModalClose();
    }
  }, [isUploading, onModalClose]);

  // Обработчик успешной загрузки изображения
  const handleImageUploaded = useCallback((url: string) => {
    setSelectedImageUrl(url);
    
    if (onImageSelected) {
      onImageSelected(url);
    }
  }, [onImageSelected]);

  return {
    isModalOpen,
    setIsModalOpen,
    selectedImageUrl,
    isUploading,
    setIsUploading,
    openModal,
    closeModal,
    handleImageUploaded
  };
}
