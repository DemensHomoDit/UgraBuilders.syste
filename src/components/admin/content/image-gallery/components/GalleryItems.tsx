
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectImage } from "@/services/project/types";
import { Pencil, Trash2, ChevronUp, ChevronDown, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import ImageDisplay from "@/components/shared/ImageDisplay";

interface GalleryItemsProps {
  images: ProjectImage[];
  onImageSelect?: (image: ProjectImage) => Promise<void>;
  onMoveUp?: (image: ProjectImage, index: number) => Promise<void>;
  onMoveDown?: (image: ProjectImage, index: number) => Promise<void>;
  onDeleteImage?: (imageId: string) => Promise<boolean>;
  onImageClick?: (image: ProjectImage) => Promise<void>;
  maxHeight?: string;
}

const GalleryItems: React.FC<GalleryItemsProps> = ({
  images,
  onImageSelect,
  onMoveUp,
  onMoveDown,
  onDeleteImage,
  onImageClick,
  maxHeight = "400px"
}) => {
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  const handleDelete = async (image: ProjectImage, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!onDeleteImage || loadingActionId === image.id) return;
    
    try {
      const confirmed = window.confirm("Вы уверены, что хотите удалить это изображение?");
      if (!confirmed) return;
      
      setLoadingActionId(image.id);
      const success = await onDeleteImage(image.id);
      if (success) {
        toast.success("Изображение удалено");
      }
    } catch (error) {
      console.error("Ошибка удаления изображения:", error);
      toast.error("Не удалось удалить изображение");
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleMoveUp = async (image: ProjectImage, e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (onMoveUp && loadingActionId !== image.id) {
      try {
        setLoadingActionId(image.id);
        await onMoveUp(image, index);
      } catch (error) {
        console.error("Ошибка при перемещении изображения вверх:", error);
        toast.error("Не удалось переместить изображение");
      } finally {
        setLoadingActionId(null);
      }
    }
  };

  const handleMoveDown = async (image: ProjectImage, e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (onMoveDown && loadingActionId !== image.id) {
      try {
        setLoadingActionId(image.id);
        await onMoveDown(image, index);
      } catch (error) {
        console.error("Ошибка при перемещении изображения вниз:", error);
        toast.error("Не удалось переместить изображение");
      } finally {
        setLoadingActionId(null);
      }
    }
  };

  const handleEdit = async (image: ProjectImage, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageSelect && loadingActionId !== image.id) {
      try {
        setLoadingActionId(image.id);
        await onImageSelect(image);
      } catch (error) {
        console.error("Ошибка при выборе изображения:", error);
      } finally {
        setLoadingActionId(null);
      }
    }
  };

  const handleImageClick = async (image: ProjectImage) => {
    if (onImageClick && loadingActionId !== image.id) {
      try {
        setLoadingActionId(image.id);
        await onImageClick(image);
      } catch (error) {
        console.error("Ошибка при клике на изображение:", error);
      } finally {
        setLoadingActionId(null);
      }
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-lg h-40">
        <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-muted-foreground">Нет добавленных изображений</p>
      </div>
    );
  }

  return (
    <ScrollArea className={`pr-4 ${maxHeight ? `max-h-[${maxHeight}]` : ''}`}>
      <div className="space-y-4">
        {images.map((image, index) => (
          <div 
            key={image.id || index}
            className="group relative flex p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
            onClick={() => handleImageClick(image)}
          >
            {/* Превью изображения */}
            <div className="w-20 h-20 flex-shrink-0 mr-3 overflow-hidden rounded-md border border-gray-200">
              <ImageDisplay
                imageUrl={image.image_url}
                alt={image.description || `Изображение ${index + 1}`}
                className="w-full h-full"
                aspectRatio="1/1"
              />
            </div>
            
            {/* Информация об изображении */}
            <div className="flex-grow min-w-0">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h4 className="text-sm font-medium truncate">
                    {image.description || "Без описания"}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {new URL(image.image_url).pathname.split('/').pop()}
                  </p>
                </div>
                
                <div className="flex space-x-1 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === 0 || loadingActionId === image.id}
                    onClick={(e) => handleMoveUp(image, e, index)}
                    className="px-2 h-7 text-xs"
                  >
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Вверх
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === images.length - 1 || loadingActionId === image.id}
                    onClick={(e) => handleMoveDown(image, e, index)}
                    className="px-2 h-7 text-xs"
                  >
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Вниз
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleEdit(image, e)}
                    className="px-2 h-7 text-xs"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Описание
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(image, e)}
                    className="px-2 h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Удалить
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default GalleryItems;
