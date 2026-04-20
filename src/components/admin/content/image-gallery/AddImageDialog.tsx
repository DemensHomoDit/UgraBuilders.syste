
import React, { useState, useEffect, memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectImage } from "@/services/project/types";
import { v4 as uuidv4 } from "uuid";
import ImageUploader from "@/components/shared/ImageUploader";

interface AddImageDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onImageAdd: (image: ProjectImage) => Promise<void>;
  folderPath?: string;
}

// Используем memo для оптимизации перерисовок
const AddImageDialog: React.FC<AddImageDialogProps> = memo(({
  projectId,
  isOpen,
  onClose,
  onImageAdd,
  folderPath = `project-${projectId}`
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Сбрасываем состояние при открытии диалога
  useEffect(() => {
    if (isOpen) {
      setImageUrl("");
      setIsUploading(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Обработчик загрузки изображения
  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  // Обработчик отправки формы с предотвращением множественных отправок
  const handleSubmit = async () => {
    if (!imageUrl || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Создаем объект изображения с минимально необходимыми полями
      const newImage: ProjectImage = {
        id: uuidv4(), // Временный ID, который будет заменен на серверный
        project_id: projectId,
        image_url: imageUrl,
        description: "", // Пустое описание по умолчанию
        display_order: 0, // Будет установлен на сервере
        created_at: new Date().toISOString(),
        image_type: "general" // Тип изображения по умолчанию
      };
      await onImageAdd(newImage);
      
      // Сбрасываем форму после успешного добавления
      setImageUrl("");
      onClose();
    } catch (error) {
      console.error("Ошибка при добавлении изображения:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработчик отмены с предотвращением закрытия во время операций
  const handleDialogClose = (open: boolean) => {
    if (!open && !isUploading && !isSubmitting) {
      setImageUrl("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить изображение</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <ImageUploader
            onImageUploaded={handleImageUploaded}
            folderPath={folderPath}
            bucketName="project-images-new"
            setIsUploading={setIsUploading}
            aspectRatio="16/9"
          />
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading || isSubmitting}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!imageUrl || isUploading || isSubmitting}
          >
            {isSubmitting ? "Сохранение..." : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

// Устанавливаем отображаемое имя для компонента
AddImageDialog.displayName = "AddImageDialog";

export default AddImageDialog;
