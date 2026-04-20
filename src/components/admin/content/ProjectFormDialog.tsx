
import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Project } from "@/services/project/types";
import { toast } from "sonner";
import { useProjectFormDialog } from "./project-list/hooks/useProjectFormDialog";
import ProjectDialogContent from "./project-list/components/ProjectDialogContent";
import { Button } from "@/components/ui/button";

const noop = () => {};
const noopAsync = async () => {};
const noopAsyncFalse = async () => false;

interface ProjectFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProject: Project | null;
  onClose: () => void;
}

/**
 * Диалог для создания и редактирования проектов
 * Разделен на компоненты для улучшения поддерживаемости
 */
const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedProject,
  onClose
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  // Используем ref для отслеживания размонтирования
  const dialogMountedRef = React.useRef(true);
  
  // Синхронизируем внутреннее состояние с внешним prop
  useEffect(() => {
    if (dialogMountedRef.current) {
      setInternalIsOpen(isOpen);
    }
  }, [isOpen]);

  // Устанавливаем флаг размонтирования при уничтожении компонента
  useEffect(() => {
    dialogMountedRef.current = true;
    return () => {
      dialogMountedRef.current = false;
    };
  }, []);

  // Логирование для отладки
  useEffect(() => {
    return () => {
    };
  }, [isOpen, internalIsOpen, selectedProject]);

  const dialogState = useProjectFormDialog({
    isOpen,
    selectedProject,
    onClose,
  });

  const {
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
    handleOpenChange: hookHandleOpenChange,
    handleFinalClose,
    handleImageDialogChange,
  } = isOpen
    ? dialogState
    : {
        activeTab: "details",
        setActiveTab: (_tab: string) => {},
        projectImages: [],
        isLoading: false,
        preventClose: false,
        isImageDialogOpen: false,
        currentProject: null,
        handleProjectSave: () => Promise.resolve(null),
        handleImageAdd: noopAsync,
        handleImageUpdate: noopAsync,
        handleImageDelete: noopAsyncFalse,
        handleImagesReorder: noopAsync,
        handleOpenChange: noop,
        handleFinalClose: noop,
        handleImageDialogChange: noop,
      };

  // Отмечаем успешную инициализацию после первого рендера
  useEffect(() => {
    if (isOpen && !initialized && dialogMountedRef.current) {
      setInitialized(true);
    }
  }, [isOpen, initialized]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleOpenChange = useCallback((open: boolean) => {
    try {
      if (isOpen) {
        hookHandleOpenChange(open);
      }

      if (!open && (preventClose || isImageDialogOpen)) {
        toast.info("Дождитесь завершения текущей операции");
        return;
      }

      if (dialogMountedRef.current) {
        setInternalIsOpen(open);
      }
      onOpenChange(open);
    } catch (e) {
      console.error("Ошибка в handleOpenChange:", e);
      const err = e instanceof Error ? e : new Error(String(e));
      if (dialogMountedRef.current) {
        setError(err);
      }
    }
  }, [hookHandleOpenChange, onOpenChange, preventClose, isImageDialogOpen, isOpen]);

  try {
    // Не рендерим ничего, если диалог закрыт - это помогает избежать проблем с DOM
    if (!internalIsOpen) {
      return null;
    }

    // Если есть ошибка, показываем компонент с ошибкой
    if (error) {
      return (
        <Dialog open={internalIsOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ошибка</DialogTitle>
            </DialogHeader>
            <div className="text-center p-4">
              <p className="text-red-500 mb-4">Произошла ошибка при загрузке формы проекта</p>
              <p className="text-sm text-gray-500 mb-4">{error.message}</p>
              <div className="mt-4 flex justify-center">
                <Button onClick={() => {
                  setError(null);
                  onClose();
                }}>
                  Закрыть
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    // Если еще не инициализирован (могут быть асинхронные операции), показываем загрузку
    if (!initialized) {
      return (
        <Dialog open={internalIsOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Загрузка...</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Dialog 
        open={internalIsOpen} 
        onOpenChange={handleOpenChange}
      >
        <DialogContent 
          className="max-w-5xl max-h-[90vh] overflow-hidden" 
          onPointerDownOutside={(e) => {
            if (preventClose || isImageDialogOpen) {
              e.preventDefault();
              toast.info("Дождитесь завершения текущей операции");
            }
          }}
          aria-describedby="project-dialog-description"
          onInteractOutside={(e) => {
            if (preventClose || isImageDialogOpen) {
              e.preventDefault();
            }
          }}
          data-focus-trap="true"
          role="dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {selectedProject ? "Редактировать проект" : "Создать новый проект"}
            </DialogTitle>
            <DialogDescription id="project-dialog-description">
              Заполните необходимые поля и добавьте изображения
            </DialogDescription>
          </DialogHeader>
          
          {/* Используем компонент содержимого диалога */}
          <ProjectDialogContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentProject={currentProject}
            projectImages={projectImages || []}
            handleProjectSave={handleProjectSave}
            handleImageAdd={handleImageAdd}
            handleImageUpdate={handleImageUpdate}
            handleImageDelete={handleImageDelete}
            handleImagesReorder={handleImagesReorder}
            handleImageDialogChange={handleImageDialogChange}
            handleFinalClose={handleFinalClose}
            preventClose={preventClose}
            isImageDialogOpen={isImageDialogOpen}
          />
        </DialogContent>
      </Dialog>
    );
  } catch (e) {
    console.error("Критическая ошибка в ProjectFormDialog:", e);
    const err = e instanceof Error ? e : new Error(String(e));
    
    // Безопасно устанавливаем состояние ошибки если компонент всё ещё смонтирован
    if (dialogMountedRef.current) {
      setError(err);
    }
    
    // Запасной рендер для критической ошибки
    return (
      <Dialog open={internalIsOpen} onOpenChange={(open) => {
        if (!open) onClose();
        onOpenChange(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Критическая ошибка</DialogTitle>
          </DialogHeader>
          <div className="text-center p-4">
            <p className="text-red-500 mb-4">Произошла критическая ошибка при загрузке формы проекта</p>
            <p className="text-sm text-gray-500 mb-4">{err.message}</p>
            <div className="mt-4 flex justify-center">
              <Button onClick={onClose}>Закрыть</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
};

// Используем React.memo для предотвращения ненужных перерисовок
export default React.memo(ProjectFormDialog);
