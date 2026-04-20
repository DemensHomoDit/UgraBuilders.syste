
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import GalleryHeader from "./GalleryHeader";
import GalleryItems from "./GalleryItems";
import { ProjectImage } from "@/services/project/types";

interface GalleryViewProps {
  localImages: ProjectImage[];
  onAddImage: () => Promise<void>;
  onImageSelect: (image: ProjectImage) => Promise<void>;
  onMoveUp: (index: number) => Promise<void>;
  onMoveDown: (index: number) => Promise<void>;
  onDeleteImage: (imageId: string) => Promise<boolean>;
}

const GalleryView: React.FC<GalleryViewProps> = ({
  localImages,
  onAddImage,
  onImageSelect,
  onMoveUp,
  onMoveDown,
  onDeleteImage
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <GalleryHeader 
          onAddClick={onAddImage}
        />
        <GalleryItems 
          images={localImages}
          onImageSelect={onImageSelect}
          onMoveUp={(image, index) => onMoveUp(index)}
          onMoveDown={(image, index) => onMoveDown(index)}
          onDeleteImage={onDeleteImage}
        />
      </CardContent>
    </Card>
  );
};

export default GalleryView;
