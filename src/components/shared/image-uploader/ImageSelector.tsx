
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageIcon, Upload } from "lucide-react";

interface ImageSelectorProps {
  onSelect: () => void;
  isUploading: boolean;
  aspectRatio?: number | string;
}

/**
 * Компонент для выбора изображения для загрузки
 */
const ImageSelector: React.FC<ImageSelectorProps> = ({
  onSelect,
  isUploading,
  aspectRatio = "16/9"
}) => {
  return (
    <Card 
      className="w-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors p-6"
      onClick={onSelect}
      style={{ aspectRatio }}
    >
      <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
      <p className="text-muted-foreground text-sm mb-4">
        Нажмите, чтобы выбрать изображение
      </p>
      <Button variant="outline" type="button" disabled={isUploading}>
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "Загрузка..." : "Выбрать файл"}
      </Button>
    </Card>
  );
};

export default ImageSelector;
