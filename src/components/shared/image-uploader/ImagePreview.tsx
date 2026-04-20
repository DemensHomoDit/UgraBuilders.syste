
import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageDisplay from "../ImageDisplay";

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
  onRetry: () => void;
  hasError: boolean;
  aspectRatio?: string | number;
}

/**
 * Компонент для предпросмотра загруженного изображения с кнопкой удаления
 */
const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  onRemove,
  onRetry,
  hasError,
  aspectRatio = "16/9"
}) => {
  return (
    <div className="relative group">
      <ImageDisplay 
        imageUrl={imageUrl}
        aspectRatio={aspectRatio}
        className="rounded-lg border border-gray-200 overflow-hidden"
        onError={onRetry}
      />
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onRemove}
          title="Удалить изображение"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ImagePreview;
