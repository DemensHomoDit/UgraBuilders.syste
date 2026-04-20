
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { Project } from "@/services/project/types";
import ImageUploader from "@/components/shared/ImageUploader";

interface ProjectImageManagerProps {
  project: Project;
  onImagesChange: (hasChanges: boolean) => void;
}

/**
 * Компонент для управления главным изображением проекта
 */
const ProjectImageManager: React.FC<ProjectImageManagerProps> = ({ 
  project,
  onImagesChange 
}) => {
  const handleImageUploaded = (imageUrl: string) => {
    if (imageUrl) {
      onImagesChange(true);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          <ImageIcon className="h-5 w-5 mr-2" />
          Изображение проекта
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ImageUploader
          imageUrl={project.cover_image}
          onImageUploaded={handleImageUploaded}
          folderPath={`project-${project.id || 'new'}`}
          aspectRatio="16/9"
        />
      </CardContent>
    </Card>
  );
};

export default ProjectImageManager;
