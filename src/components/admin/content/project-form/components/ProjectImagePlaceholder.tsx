
import React from "react";
import { ImageIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Компонент-заглушка, отображаемый когда проект еще не сохранен
 */
const ProjectImagePlaceholder: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-md text-muted-foreground">
      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
      <p className="mb-4">Сохраните проект, чтобы добавить изображения</p>
      <Button disabled variant="outline">
        <PlusCircle className="h-4 w-4 mr-2" />
        Добавить изображения
      </Button>
    </div>
  );
};

export default ProjectImagePlaceholder;
