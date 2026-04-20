
import { useState, useCallback, useEffect } from "react";
import { ProjectImage } from "@/services/project/types";
import projectService from "@/services/project/index";
import { toast } from "sonner";

export const useProjectImages = (projectId: string) => {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [mainImages, setMainImages] = useState<ProjectImage[]>([]);
  const [generalImages, setGeneralImages] = useState<ProjectImage[]>([]);
  const [floorPlanImages, setFloorPlanImages] = useState<ProjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAndCategorizeImages = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const projectImages = await projectService.getProjectImages(projectId);
      setImages(projectImages);
      
      // Строгая категоризация изображений по типу
      const main: ProjectImage[] = [];
      const general: ProjectImage[] = [];
      const floorPlan: ProjectImage[] = [];
      
      projectImages.forEach(img => {
        switch (img.image_type) {
          case "main":
            main.push(img);
            break;
          case "floor_plan":
            floorPlan.push(img);
            break;
          default:
            general.push(img);
            break;
        }
      });
      
      // Сортировка по порядку отображения
      const sortByOrder = (a: ProjectImage, b: ProjectImage) => 
        (a.display_order || 0) - (b.display_order || 0);
      
      setMainImages(main.sort(sortByOrder));
      setGeneralImages(general.sort(sortByOrder));
      setFloorPlanImages(floorPlan.sort(sortByOrder));
      
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
    description: string = "",
    imageType: "main" | "general" | "floor_plan" = "general"
  ) => {
    if (!projectId) return null;
    
    try {
      const newImage = await projectService.addProjectImage(
        projectId,
        imageUrl,
        description,
        imageType
      );
      
      if (newImage) {
        await loadAndCategorizeImages(); // Перезагружаем все изображения
        return newImage;
      }
    } catch (err) {
      console.error("Ошибка при добавлении изображения:", err);
      throw err;
    }
    return null;
  }, [projectId, loadAndCategorizeImages]);

  // Обновление информации об изображении
  const updateImageInfo = useCallback(async (
    imageId: string,
    description: string,
    imageType: "main" | "general" | "floor_plan"
  ) => {
    try {
      const success = await projectService.updateImageDescription(
        imageId,
        description,
        imageType
      );
      
      if (success) {
        await loadAndCategorizeImages(); // Перезагружаем все изображения
        return true;
      }
    } catch (err) {
      console.error("Ошибка при обновлении изображения:", err);
      throw err;
    }
    return false;
  }, [loadAndCategorizeImages]);

  // Удаление изображения
  const deleteProjectImage = useCallback(async (imageId: string) => {
    try {
      const success = await projectService.deleteProjectImage(imageId);
      if (success) {
        await loadAndCategorizeImages(); // Перезагружаем все изображения
        return true;
      }
    } catch (err) {
      console.error("Ошибка при удалении изображения:", err);
      throw err;
    }
    return false;
  }, [loadAndCategorizeImages]);

  // Первоначальная загрузка изображений
  useEffect(() => {
    if (projectId) {
      loadAndCategorizeImages();
    }
  }, [projectId, loadAndCategorizeImages]);

  return {
    images,
    mainImages,
    generalImages,
    floorPlanImages,
    isLoading,
    error,
    addProjectImage,
    updateImageInfo,
    deleteProjectImage,
    reloadImages: loadAndCategorizeImages
  };
};
