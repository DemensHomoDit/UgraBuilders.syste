
import { useState, useEffect, useCallback, useRef } from "react";
import { Project, ProjectImage } from "@/services/project/types";
import { toast } from "sonner";
import { Project as ProjectType } from "@/types/project";
import projectImageService from "@/services/project/index";

interface UseProjectFormDialogProps {
  isOpen: boolean;
  selectedProject: Project | null;
  onClose: () => void;
}

export const useProjectFormDialog = ({
  isOpen,
  selectedProject,
  onClose
}: UseProjectFormDialogProps) => {
  // Базовые состояния
  const [activeTab, setActiveTab] = useState("details");
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preventClose, setPreventClose] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [savedProject, setSavedProject] = useState<Project | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const isMountedRef = useRef(true);
  const initRef = useRef(false);
  const cleanupActionsRef = useRef<Array<() => void>>([]);

  // Функция для добавления действий очистки
  const addCleanupAction = useCallback((cleanupFn: () => void) => {
    cleanupActionsRef.current.push(cleanupFn);
  }, []);

  // Безопасное обновление состояния
  const safeSetState = useCallback(<T extends any>(
    setter: React.Dispatch<React.SetStateAction<T>>, 
    value: React.SetStateAction<T>
  ) => {
    if (!isMountedRef.current) {
      console.warn("Попытка обновить состояние размонтированного компонента");
      return;
    }
    
    try {
      setter(value);
    } catch (error) {
      console.error("Ошибка при установке состояния:", error);
    }
  }, []);

  // Функция загрузки изображений проекта с повторными попытками
  const loadProjectImages = useCallback(async (
    projectId: string, 
    retryCount = 3
  ) => {
    if (!projectId) {
      console.warn("projectId не указан для загрузки изображений");
      return;
    }
    
    if (!isMountedRef.current) return;
    
    safeSetState(setIsLoading, true);
    
    try {
      const images = await projectImageService.getProjectImages(projectId);
      
      if (!isMountedRef.current) return;
      
      if (Array.isArray(images)) {
        safeSetState(setProjectImages, images);
      } else {
        console.warn("Для проекта нет сохраненных изображений или получен неверный формат данных");
        safeSetState(setProjectImages, []);
      }
    } catch (error: any) {
      console.error("Ошибка при загрузке изображений проекта:", error);
      
      if (retryCount > 0 && isMountedRef.current) {
        setTimeout(() => {
          loadProjectImages(projectId, retryCount - 1);
        }, 1000);
      } else {
        // Если все попытки исчерпаны, показываем уведомление
        if (isMountedRef.current) {
          toast.error("Ошибка при загрузке изображений", {
            description: error.message
          });
          safeSetState(setProjectImages, []);
        }
      }
    } finally {
      if (isMountedRef.current) {
        safeSetState(setIsLoading, false);
      }
    }
  }, [safeSetState]);

  // Инициализация состояния при открытии диалога
  useEffect(() => {
    // Сбрасываем состояния при каждом открытии
    if (isOpen) {
      try {
        // Устанавливаем флаг инициализации
        initRef.current = true;
        
        // Устанавливаем текущий проект
        safeSetState(setCurrentProject, selectedProject);
        
        // Всегда начинаем с вкладки деталей
        safeSetState(setActiveTab, "details");
        
        // Загружаем изображения, если есть ID проекта
        if (selectedProject?.id) {
          loadProjectImages(selectedProject.id);
        } else {
          safeSetState(setProjectImages, []);
        }
      } catch (error) {
        console.error("Ошибка при инициализации состояния диалога:", error);
        toast.error("Не удалось загрузить данные проекта");
      }
    } else {
      // Сбрасываем флаг инициализации при закрытии
      initRef.current = false;
    }
  }, [selectedProject, isOpen, safeSetState, loadProjectImages]);

  // Управление жизненным циклом компонента
  useEffect(() => {
    isMountedRef.current = true;
    
    // Для диагностики
    return () => {
      isMountedRef.current = false;
      
      // Выполняем все зарегистрированные действия очистки
      cleanupActionsRef.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.error("Ошибка при выполнении действия очистки:", error);
        }
      });
      
      // Очищаем список действий очистки
      cleanupActionsRef.current = [];
    };
  }, []);

  // Обработчик открытия/закрытия диалога
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && (preventClose || isImageDialogOpen)) {
      toast.info("Дождитесь завершения текущей операции");
      return false;
    }
    
    return true;
  }, [preventClose, isImageDialogOpen]);

  // Обработчик закрытия диалога
  const handleFinalClose = useCallback(() => {
    if (isLoading || preventClose || isImageDialogOpen) {
      toast.info("Дождитесь завершения текущей операции");
      return;
    }
    
    // Сбрасываем состояния
    safeSetState(setActiveTab, "details");
    safeSetState(setProjectImages, []);
    safeSetState(setSavedProject, null);
    safeSetState(setCurrentProject, null);
    
    // Вызываем колбэк закрытия
    onClose();
  }, [onClose, isLoading, preventClose, isImageDialogOpen, safeSetState]);

  // Обработчик сохранения проекта
  const handleProjectSave = useCallback((project: ProjectType) => {
    try {
      // Явно преобразуем pricevalue к числу перед сохранением
      const processedProject = {...project};
      
      if (typeof processedProject.pricevalue !== 'undefined') {
        try {
          if (typeof processedProject.pricevalue === 'string') {
            // Если это строка, очищаем от нечисловых символов
            const priceString: string = processedProject.pricevalue;
            const cleanedPrice = parseFloat(priceString.replace(/[^\d.-]/g, ''));
            processedProject.pricevalue = isNaN(cleanedPrice) ? null : cleanedPrice;
          } else {
            // Если не строка, просто преобразуем к числу
            const numPrice = Number(processedProject.pricevalue);
            processedProject.pricevalue = isNaN(numPrice) ? null : numPrice;
          }
        } catch (e) {
          console.error("Ошибка при преобразовании цены:", e);
          processedProject.pricevalue = null;
        }
      }
      // Устанавливаем текущий и сохраненный проект
      safeSetState(setCurrentProject, processedProject as any);
      safeSetState(setSavedProject, processedProject as any);
      
      // После сохранения переключаемся на вкладку images, если это новый проект
      if (!selectedProject?.id && processedProject.id) {
        safeSetState(setActiveTab, "images");
        
        // Загружаем изображения для нового проекта
        loadProjectImages(processedProject.id);
      }
      
      return processedProject;
    } catch (error) {
      console.error("Ошибка в handleProjectSave:", error);
      toast.error("Ошибка при сохранении проекта");
      return null;
    }
  }, [selectedProject, safeSetState, loadProjectImages]);

  // Обработчики для изображений
  const handleImageAdd = useCallback(async (image: ProjectImage) => {
    const projectId = currentProject?.id;
    try {
      if (!projectId) {
        toast.error("ID проекта не определен");
        return;
      }
      
      safeSetState(setPreventClose, true);
      
      // Добавляем изображение оптимистично
      safeSetState(setProjectImages, prev => [...prev, image]);
      
      // Асинхронно обновляем в базе данных
      await projectImageService.addProjectImage(
        projectId, 
        image.image_url, 
        image.description || "",
        image.image_type || "general"
      );
      
      // Перезагружаем изображения для получения точных данных
      await loadProjectImages(projectId);
    } catch (error: any) {
      console.error("Ошибка при добавлении изображения:", error);
      toast.error("Не удалось добавить изображение", {
        description: error.message
      });
      
      // Откатываем оптимистичное обновление
      if (projectId) {
        await loadProjectImages(projectId);
      }
    } finally {
      safeSetState(setPreventClose, false);
    }
  }, [currentProject, safeSetState, loadProjectImages]);

  const handleImageUpdate = useCallback(async (imageId: string, data: Partial<ProjectImage>) => {
    try {
      if (!currentProject?.id) {
        toast.error("ID проекта не определен");
        return;
      }
      
      safeSetState(setPreventClose, true);
      
      // Оптимистичное обновление
      safeSetState(setProjectImages, prev => 
        prev.map(img => img.id === imageId ? { ...img, ...data } : img)
      );
      
      // Обновляем в базе данных
      if (data.description !== undefined) {
        await projectImageService.updateImageDescription(
          imageId, 
          data.description || "", 
          data.image_type || "general"
        );
      }
    } catch (error: any) {
      console.error("Ошибка при обновлении изображения:", error);
      toast.error("Не удалось обновить изображение", {
        description: error.message
      });
      
      // Откатываем оптимистичное обновление
      if (currentProject?.id) {
        await loadProjectImages(currentProject.id);
      }
    } finally {
      safeSetState(setPreventClose, false);
    }
  }, [currentProject, safeSetState, loadProjectImages]);

  const handleImageDelete = useCallback(async (imageId: string) => {
    try {
      if (!currentProject?.id) {
        toast.error("ID проекта не определен");
        return false;
      }
      
      safeSetState(setPreventClose, true);
      
      // Оптимистичное удаление
      safeSetState(setProjectImages, prev => 
        prev.filter(img => img.id !== imageId)
      );
      
      // Удаляем из базы данных
      await projectImageService.deleteProjectImage(imageId);
      return true;
    } catch (error: any) {
      console.error("Ошибка при удалении изображения:", error);
      toast.error("Не удалось удалить изображение", {
        description: error.message
      });
      
      // Откатываем оптимистичное удаление
      if (currentProject?.id) {
        await loadProjectImages(currentProject.id);
      }
      return false;
    } finally {
      safeSetState(setPreventClose, false);
    }
  }, [currentProject, safeSetState, loadProjectImages]);

  const handleImagesReorder = useCallback(async (reorderedImages: ProjectImage[]) => {
    try {
      if (!currentProject?.id) {
        toast.error("ID проекта не определен");
        return;
      }
      
      safeSetState(setPreventClose, true);
      
      // Оптимистичное обновление
      safeSetState(setProjectImages, reorderedImages);
      
      // Подготавливаем данные для обновления порядка
      const orderData = reorderedImages.map((img, index) => ({
        id: img.id,
        display_order: index
      }));
      
      // Используем правильный метод updateImagesOrder
      await projectImageService.updateImagesOrder(orderData);
    } catch (error: any) {
      console.error("Ошибка при изменении порядка изображений:", error);
      toast.error("Не удалось изменить порядок изображений", {
        description: error.message
      });
      
      // Откатываем оптимистичное обновление
      if (currentProject?.id) {
        await loadProjectImages(currentProject.id);
      }
    } finally {
      setTimeout(() => {
        safeSetState(setPreventClose, false);
      }, 500);
    }
  }, [currentProject, safeSetState, loadProjectImages]);

  const handleImageDialogChange = useCallback((open: boolean) => {
    safeSetState(setIsImageDialogOpen, open);
  }, [safeSetState]);

  return {
    activeTab,
    setActiveTab,
    projectImages,
    isLoading,
    preventClose,
    isImageDialogOpen,
    currentProject,
    handleProjectSave,
    handleImageAdd,
    handleImageUpdate,
    handleImageDelete,
    handleImagesReorder,
    handleOpenChange,
    handleFinalClose,
    handleImageDialogChange,
    addCleanupAction
  };
};
