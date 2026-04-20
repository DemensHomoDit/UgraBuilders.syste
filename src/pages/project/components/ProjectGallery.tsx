
import React from "react";
import ImageDisplay from "@/components/shared/ImageDisplay";
import { View } from "lucide-react";
import { ProjectImage } from "@/services/project/types";

interface ProjectGalleryProps {
  images: ProjectImage[];
  onImageClick?: (index: number) => void;
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ images, onImageClick }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm">
    <h2 className="text-xl font-semibold mb-4">Галерея проекта</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {images.map((image, index) => (
        <div 
          key={image.id} 
          className="group relative aspect-video rounded-lg overflow-hidden shadow-sm cursor-pointer"
          onClick={() => onImageClick?.(index)}
        >
          <ImageDisplay 
            imageUrl={image.image_url} 
            alt={image.description || `Изображение ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <View className="w-8 h-8 text-white" />
          </div>
          {image.description && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <div className="p-3 w-full">
                <p className="text-white text-sm">{image.description}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default ProjectGallery;
