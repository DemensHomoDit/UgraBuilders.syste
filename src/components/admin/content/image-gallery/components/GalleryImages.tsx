
import React from "react";
import { ProjectImage } from "@/services/project/types";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown, FileText, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImagesProps {
  images: ProjectImage[];
  isLoading: boolean;
  onDeleteImage: (imageId: string) => Promise<void>;
  onMoveUp: (imageId: string) => void;
  onMoveDown: (imageId: string) => void;
  onEditDescription: (image: ProjectImage) => void;
}

const GalleryImages: React.FC<GalleryImagesProps> = ({
  images,
  isLoading,
  onDeleteImage,
  onMoveUp,
  onMoveDown,
  onEditDescription
}) => {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 border border-dashed border-gray-300 rounded-lg">
        <Image className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-muted-foreground">Нет добавленных изображений</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {images.map((image, index) => (
        <div 
          key={image.id || index}
          className="relative flex items-start gap-4 border border-gray-200 rounded-lg p-4 bg-white"
        >
          <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded border border-gray-200">
            <img
              src={image.image_url}
              alt={image.description || "Изображение проекта"}
              className="h-full w-full object-cover"
            />
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-1 text-gray-500" />
                  {image.description ? (
                    <span className="truncate">{image.description}</span>
                  ) : (
                    <span className="text-gray-400 italic">Без описания</span>
                  )}
                </h4>
                
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {new URL(image.image_url).pathname.split('/').pop()}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveUp(image.id || "")}
                  disabled={isLoading || index === 0}
                  className={cn(
                    "h-7 w-7 p-0",
                    index === 0 ? "opacity-30" : ""
                  )}
                >
                  <ArrowUp className="h-4 w-4" />
                  <span className="sr-only">Вверх</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveDown(image.id || "")}
                  disabled={isLoading || index === images.length - 1}
                  className={cn(
                    "h-7 w-7 p-0",
                    index === images.length - 1 ? "opacity-30" : ""
                  )}
                >
                  <ArrowDown className="h-4 w-4" />
                  <span className="sr-only">Вниз</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditDescription(image)}
                  disabled={isLoading}
                  className="h-7 p-0 px-1"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  <span className="text-xs">Описание</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteImage(image.id || "")}
                  disabled={isLoading}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Удалить</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GalleryImages;
