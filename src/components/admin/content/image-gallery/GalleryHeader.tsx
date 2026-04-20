
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface GalleryHeaderProps {
  onAddClick: () => void;
}

const GalleryHeader: React.FC<GalleryHeaderProps> = ({ onAddClick }) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Галерея изображений</h3>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" /> Добавить изображение
      </Button>
    </div>
  );
};

export default GalleryHeader;
