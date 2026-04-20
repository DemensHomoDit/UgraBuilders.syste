
import { useState, useCallback } from "react";
import { ProjectImage } from "@/services/project/imageService/types";
import projectService from "@/services/project/index";
import { toast } from "sonner";

export const useProjectImages = (projectId: string) => {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение изображений проекта
  const fetchImages = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const projectImages = await projectService.getProjectImages(projectId);
      setImages(projectImages);
    } catch (err: any) {
      console.error("Ошибка при загрузке изображений:", err);
      setError(err.message || "Ошибка при загрузке изображений");
      toast.error("Ошибка при загрузке изображений");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Добавление нового изображения
  const addProjectImage = useCallback(async (
    imageUrl: string, 
    description?: string,
    imageType: "main" | "general" | "floor_plan" = "general"
  ) => {
    if (!projectId) {
      throw new Error("ID проекта не указан");
    }
    
    setIsLoading(true);
    
    try {
      const newImage = await projectService.addProjectImage(
        projectId, 
        imageUrl, 
        description || "",
        imageType
      );
      
      if (newImage) {
        setImages(prev => [...prev, newImage]);
        return newImage;
      } else {
        console.error("Error adding project image: No image returned");
        throw new Error("Не удалось добавить изображение");
      }
    } catch (err) {
      console.error("Error adding project image:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Обновление описания изображения
  const updateImageDescription = useCallback(async (
    imageId: string, 
    description: string,
    imageType?: "main" | "general" | "floor_plan"
  ) => {
    setIsLoading(true);
    
    try {
      const success = await projectService.updateImageDescription(imageId, description, imageType);
      
      if (success) {
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, description, image_type: imageType || img.image_type } 
            : img
        ));
        return true;
      } else {
        throw new Error("Не удалось обновить изображение");
      }
    } catch (err) {
      console.error("Ошибка при обновлении изображения:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Удаление изображения
  const deleteProjectImage = useCallback(async (imageId: string) => {
    setIsLoading(true);
    
    try {
      const success = await projectService.deleteProjectImage(imageId);
      
      if (success) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        return true;
      } else {
        throw new Error("Не удалось удалить изображение");
      }
    } catch (err) {
      console.error("Ошибка при удалении изображения:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    images,
    isLoading,
    error,
    fetchImages,
    addProjectImage,
    updateImageDescription,
    deleteProjectImage
  };
};
