
import { useState } from "react";
import { ProjectImage } from "@/services/project/types";

/**
 * Хук для управления изображениями проекта
 */
export const useProjectImages = () => {
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  return {
    projectImages,
    setProjectImages,
    isLoading,
    setIsLoading
  };
};
