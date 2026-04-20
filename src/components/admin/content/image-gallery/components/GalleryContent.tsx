
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import GalleryHeader from "./GalleryHeader";
import GalleryItems from "./GalleryItems";
import { ProjectImage } from "@/services/project/types";

interface GalleryContentProps {
  images: ProjectImage[];
  onImageSelect?: (image: ProjectImage) => Promise<void>;
  onMoveUp?: (image: ProjectImage) => Promise<void>;
  onMoveDown?: (image: ProjectImage) => Promise<void>;
  onDeleteImage?: (imageId: string) => Promise<boolean>;
  onImageClick?: (image: ProjectImage) => Promise<void>;
  onAddImage?: () => Promise<void>;
  title?: string;
}

const GalleryContent: React.FC<GalleryContentProps> = ({ 
  images, 
  onImageSelect, 
  onMoveUp, 
  onMoveDown, 
  onDeleteImage, 
  onImageClick,
  onAddImage,
  title
}) => {
  // Обработчик выбора изображения для редактирования
  const handleSelectImage = async (image: ProjectImage): Promise<void> => {
    if (onImageSelect) {
      return onImageSelect(image);
    }
    return Promise.resolve();
  };

  // Обработчик удаления изображения
  const handleDeleteImage = async (imageId: string): Promise<boolean> => {
    if (onDeleteImage) {
      return onDeleteImage(imageId);
    }
    return Promise.resolve(false);
  };

  // Обработчик для onAddImage, который должен возвращать Promise<void>
  const handleAddImage = async (): Promise<void> => {
    if (onAddImage) {
      return onAddImage();
    }
    return Promise.resolve();
  };

  // Обработчик для onImageClick, который должен возвращать Promise<void>
  const handleImageClick = async (image: ProjectImage): Promise<void> => {
    if (onImageClick) {
      return onImageClick(image);
    }
    return Promise.resolve();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <GalleryHeader 
          onAddClick={handleAddImage}
          title={title} 
        />
        <GalleryItems 
          images={images}
          onImageSelect={handleSelectImage}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDeleteImage={handleDeleteImage}
          onImageClick={handleImageClick}
        />
      </CardContent>
    </Card>
  );
};

export default GalleryContent;
