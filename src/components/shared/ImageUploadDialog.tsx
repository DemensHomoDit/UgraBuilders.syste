import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import ImageUploader from "@/components/shared/ImageUploader";

export interface UploadedImage {
  imageUrl: string;
  description?: string;
}

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (image: UploadedImage) => Promise<void>;
  bucketName?: string;
  title?: string;
  description?: string;
  allowDescription?: boolean;
  aspectRatio?: string | number;
}

const ImageUploadDialog: React.FC<ImageUploadDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  bucketName = "project-images-new",
  title = "Загрузить изображение",
  description = "Выберите изображение для загрузки",
  allowDescription = true,
  aspectRatio = "16:9"
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageDescription, setImageDescription] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setImageUrl("");
      setImageDescription("");
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSaving) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!imageUrl) return;
    setIsSaving(true);
    try {
      await onSave({ imageUrl, description: imageDescription || undefined });
    } finally {
      setIsSaving(false);
    }
  };

  const preventPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[540px]"
        onClick={preventPropagation}
        onPointerDownOutside={(e) => {
          if (isSaving) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isSaving) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <ImageUploader
            onImageUploaded={setImageUrl}
            imageUrl={imageUrl}
            bucketName={bucketName}
            folderPath=""
            aspectRatio={aspectRatio}
          />

          {allowDescription && imageUrl && (
            <div className="space-y-2">
              <Label htmlFor="image-description">Описание</Label>
              <Textarea
                id="image-description"
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                placeholder="Описание изображения (необязательно)"
                rows={2}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            type="button"
            disabled={isSaving}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={!imageUrl || isSaving}
            type="button"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              "Сохранить"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;
export type { ImageUploadDialogProps };