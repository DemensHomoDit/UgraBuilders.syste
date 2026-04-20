
import React, { useState, useEffect, memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProjectImage } from "@/services/project/types";

interface EditDescriptionDialogProps {
  image: ProjectImage;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSave: (description: string) => Promise<void>;
}

// Используем memo для оптимизации перерисовок
const EditDescriptionDialog: React.FC<EditDescriptionDialogProps> = memo(({
  image,
  isOpen,
  isLoading,
  onClose,
  onSave
}) => {
  const [description, setDescription] = useState(image?.description || "");
  const [isSaving, setIsSaving] = useState(false);

  // Синхронизация описания с полученным изображением
  useEffect(() => {
    if (image && isOpen) {
      setDescription(image.description || "");
    }
  }, [image, isOpen]);

  // Обработчик сохранения с предотвращением повторных отправок
  const handleSave = async () => {
    if (isSaving) return;
    
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

  // Безопасное закрытие диалога
  const handleDialogClose = (open: boolean) => {
    if (!open && !isSaving) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать описание</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="w-full">
              <img
                src={image?.image_url}
                alt="Изображение"
                className="w-full h-auto rounded-md max-h-40 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='20'%3EImage unavailable%3C/text%3E%3C/svg%3E";
                }}
              />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Описание
            </label>
            <Textarea
              id="description"
              className="min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание для изображения"
              disabled={isSaving || isLoading}
            />
          </div>
        </div>
        
        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

// Устанавливаем отображаемое имя для компонента
EditDescriptionDialog.displayName = "EditDescriptionDialog";

export default EditDescriptionDialog;
