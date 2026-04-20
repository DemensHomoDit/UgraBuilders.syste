
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image } from "lucide-react";

interface EmptyGalleryProps {
  onAddClick: () => void;
}

const EmptyGallery: React.FC<EmptyGalleryProps> = ({ onAddClick }) => {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-10">
        <Image className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Нет изображений в галерее</p>
        <Button 
          variant="secondary" 
          size="sm" 
          className="mt-4"
          onClick={onAddClick}
        >
          Добавить первое изображение
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyGallery;
