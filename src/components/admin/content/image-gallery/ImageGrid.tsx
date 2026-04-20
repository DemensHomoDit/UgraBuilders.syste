
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ProjectImage } from "@/services/project/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Define ImageOrder type here
interface ImageOrder {
  id: string;
  display_order: number;
}

interface ImageGridProps {
  images: ProjectImage[];
  onDeleteImage: (id: string) => Promise<void>;
  onUpdateDescription: (id: string, description: string) => Promise<void>;
  onReorder: (orderedImages: ImageOrder[]) => Promise<void>;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onDeleteImage,
  onUpdateDescription,
  onReorder
}) => {
  const [editingImage, setEditingImage] = useState<ProjectImage | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = (image: ProjectImage) => {
    setEditingImage(image);
    setDescription(image.description || "");
  };

  const handleSaveDescription = async () => {
    if (!editingImage) return;
    
    try {
      setIsSubmitting(true);
      await onUpdateDescription(editingImage.id, description);
      setEditingImage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    
    const orderedImages: ImageOrder[] = newImages.map((img, i) => ({
      id: img.id,
      display_order: i
    }));
    
    await onReorder(orderedImages);
  };

  const handleMoveDown = async (index: number) => {
    if (index >= images.length - 1) return;
    
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    
    const orderedImages: ImageOrder[] = newImages.map((img, i) => ({
      id: img.id,
      display_order: i
    }));
    
    await onReorder(orderedImages);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <Card key={image.id} className="overflow-hidden">
          <AspectRatio ratio={16/9}>
            <img
              src={image.image_url}
              alt={image.description || `Изображение ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 truncate mr-2">
                <p className="text-sm text-muted-foreground truncate">
                  {image.description || `Изображение ${index + 1}`}
                </p>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="h-8 w-8"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === images.length - 1}
                  className="h-8 w-8"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(image)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteImage(image.id)}
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog
        open={!!editingImage}
        onOpenChange={(open) => {
          if (!open) setEditingImage(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать описание</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание изображения"
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingImage(null)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSaveDescription}
              disabled={isSubmitting}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGrid;
