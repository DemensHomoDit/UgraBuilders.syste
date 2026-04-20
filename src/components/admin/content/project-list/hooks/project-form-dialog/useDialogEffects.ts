
import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Project, ProjectImage } from "@/services/project/types";
import projectService from "@/services/project/index";

/**
 * Хук для управления эффектами диалога: загрузка изображений, сброс состояния
 */
export const useDialogEffects = (props: {
  isOpen: boolean;
  selectedProject: Project | null;
  savedProject: Project | null;
  isMountedRef: React.MutableRefObject<boolean>;
  setActiveTab: (tab: string) => void;
  setProjectImages: React.Dispatch<React.SetStateAction<ProjectImage[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPreventClose: React.Dispatch<React.SetStateAction<boolean>>;
  setSavedProject: React.Dispatch<React.SetStateAction<Project | null>>;
}) => {
  const {
    isOpen,
    selectedProject,
    savedProject,
    isMountedRef,
    setActiveTab,
    setProjectImages,
    setIsLoading,
    setPreventClose,
    setSavedProject
  } = props;
  
  // Безопасная установка состояния с проверкой на монтирование компонента
  const safeSetState = useCallback(<T extends any>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    value: React.SetStateAction<T>
  ) => {
    if (isMountedRef.current) {
      setter(value);
    }
  }, [isMountedRef]);

  // Загрузка изображений проекта
  useEffect(() => {
    let isCancelled = false;
    
    const loadProjectImages = async () => {
      if (!isOpen || isCancelled) return;
      
      const projectId = selectedProject?.id || savedProject?.id;
      if (!projectId) {
        safeSetState(setProjectImages, []);
        return;
      }
      
      safeSetState(setIsLoading, true);
      try {
        console.debug("Loading images for project:", projectId);
        const images = await projectService.getProjectImages(projectId);
        
        if (isCancelled) return;
        
        const typedImages: ProjectImage[] = images.map(img => ({
          id: img.id,
          project_id: img.project_id,
          image_url: img.image_url,
          description: img.description || "",
          display_order: img.display_order,
          created_at: img.created_at,
          image_type: img.image_type || "general" // Добавляем значение по умолчанию
        }));
        
        safeSetState(setProjectImages, typedImages);
      } catch (error) {
        console.error("Failed to load project images:", error);
        if (!isCancelled) {
          toast.error("Ошибка загрузки изображений");
        }
      } finally {
        if (!isCancelled) {
          safeSetState(setIsLoading, false);
        }
      }
    };

    // Загружаем изображения при открытии диалога и наличии проекта
    if (isOpen && (selectedProject?.id || savedProject?.id)) {
      loadProjectImages();
    }
    
    return () => {
      isCancelled = true;
    };
  }, [isOpen, selectedProject?.id, savedProject?.id, safeSetState, setProjectImages, setIsLoading]);

  // Сброс состояния при закрытии диалога
  useEffect(() => {
    if (!isOpen) {
      safeSetState(setActiveTab, "details");
      safeSetState(setPreventClose, false);
      
      // Сбрасываем сохраненный проект только если нет выбранного проекта
      if (!selectedProject?.id) {
        safeSetState(setSavedProject, null);
      }
    }
  }, [isOpen, selectedProject?.id, safeSetState, setActiveTab, setPreventClose, setSavedProject]);

  return { safeSetState };
};
