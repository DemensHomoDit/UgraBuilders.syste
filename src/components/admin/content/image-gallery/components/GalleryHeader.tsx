
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface GalleryHeaderProps {
  onAddClick: () => void;
  title?: string;
}

const GalleryHeader: React.FC<GalleryHeaderProps> = ({ 
  onAddClick,
  title = "Галерея изображений"
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Button onClick={onAddClick} size="sm">
        <Plus className="mr-2 h-4 w-4" /> Добавить изображение
      </Button>
    </div>
  );
};

export default GalleryHeader;
