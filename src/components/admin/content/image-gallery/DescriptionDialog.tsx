
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectImage } from "@/services/project/types";

interface DescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImage: ProjectImage;
  onSave: (description: string) => Promise<void>;
  isLoading: boolean;
}

const DescriptionDialog: React.FC<DescriptionDialogProps> = ({
  isOpen,
  onClose,
  selectedImage,
  onSave,
  isLoading
}) => {
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Обновляем описание при изменении выбранного изображения
  useEffect(() => {
    if (selectedImage) {
      setDescription(selectedImage.description || "");
    }
  }, [selectedImage]);

  // Обработчик сохранения описания
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await onSave(description);
      onClose();
    } catch (error) {
      console.error("Ошибка при сохранении описания:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Не рендерим ничего, если диалог закрыт - это помогает избежать проблем с DOM
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать описание</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="w-full">
            <img
              src={selectedImage?.image_url}
              alt="Изображение"
              className="w-full h-auto rounded-md max-h-40 object-cover"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Описание
            </label>
            <textarea
              id="description"
              className="w-full min-h-[80px] p-2 border rounded-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание для изображения"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading || isSaving}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || isSaving}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DescriptionDialog;
