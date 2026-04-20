
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ProjectForm from "../../project-form/ProjectForm";
import { ImageGallery } from "../../image-gallery";
import { Project as ServiceProject, ProjectImage } from "@/services/project/types";
import { Project } from "@/types/project";
import { toast } from "sonner";

interface ProjectDialogContentProps {
  // Состояние вкладок
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Данные проекта и изображений
  currentProject: ServiceProject | null;
  projectImages: ProjectImage[];
  
  // Обработчики действий
  handleProjectSave: (project: Project) => void;
  handleImageAdd: (image: ProjectImage) => Promise<void>;
  handleImageUpdate: (imageId: string, data: Partial<ProjectImage>) => Promise<void>;
  handleImageDelete: (imageId: string) => Promise<boolean>;
  handleImagesReorder: (reorderedImages: ProjectImage[]) => Promise<void>;
  handleImageDialogChange: (open: boolean) => void;
  handleFinalClose: () => void;
  
  // Состояния блокировки
  preventClose: boolean;
  isImageDialogOpen: boolean;
}

/**
 * Компонент содержимого диалога проекта
 * Отображает либо форму создания нового проекта, либо вкладки с формой и изображениями
 */
const ProjectDialogContent: React.FC<ProjectDialogContentProps> = ({
  activeTab,
  setActiveTab,
  currentProject,
  projectImages,
  handleProjectSave,
  handleImageAdd,
  handleImageUpdate,
  handleImageDelete,
  handleImagesReorder,
  handleImageDialogChange,
  handleFinalClose,
  preventClose,
  isImageDialogOpen
}) => {
  const [renderError, setRenderError] = useState<Error | null>(null);
  
  // Для отладки выводим данные проекта
  useEffect(() => {
  }, [currentProject, activeTab, projectImages]);

  try {
    // Защита от несуществующих данных
    if (!projectImages) {
      console.error("projectImages не определены");
      throw new Error("Ошибка загрузки изображений");
    }
    
    // Безопасная обработка изображений проекта
    const safeImages = Array.isArray(projectImages) ? projectImages : [];
  
    // Если проект еще не создан, показываем только форму проекта
    if (!currentProject?.id) {
      return (
        <div className="overflow-y-auto pr-2" style={{ maxHeight: "calc(90vh - 120px)" }}>
          <ProjectForm 
            onSave={(project) => {
              try {
                handleProjectSave(project);
              } catch (error) {
                console.error("Ошибка при сохранении проекта:", error);
                toast.error("Не удалось сохранить проект");
              }
            }}
            onCancel={handleFinalClose}
          />
        </div>
      );
    }

    // Для существующего проекта показываем вкладки
    return (
      <div className="overflow-y-auto pr-2" style={{ maxHeight: "calc(90vh - 120px)" }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="details">Детали проекта</TabsTrigger>
            <TabsTrigger value="images">Изображения</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="focus-visible:outline-none focus-visible:ring-0">
            <ProjectForm 
              project={currentProject as unknown as Project}
              onSave={(project) => {
                try {
                  handleProjectSave(project);
                } catch (error) {
                  console.error("Ошибка при обновлении проекта:", error);
                  toast.error("Не удалось обновить проект");
                }
              }}
              onCancel={handleFinalClose}
            />
          </TabsContent>
          <TabsContent value="images" className="focus-visible:outline-none focus-visible:ring-0">
            {currentProject?.id && (
              <div className="space-y-4">
                <ImageGallery
                  projectId={currentProject.id}
                  images={safeImages}
                  onImageAdd={handleImageAdd}
                  onImageUpdate={handleImageUpdate}
                  onImageDelete={handleImageDelete}
                  onImagesReorder={handleImagesReorder}
                  onDialogChange={handleImageDialogChange}
                />
                
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={handleFinalClose}
                    disabled={preventClose || isImageDialogOpen}
                  >
                    Завершить
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error("Ошибка в компоненте ProjectDialogContent:", error);
    const err = error instanceof Error ? error : new Error(String(error));
    setRenderError(err);
    return <ErrorFallback onClose={handleFinalClose} message={`Ошибка при отображении формы проекта: ${err.message}`} />;
  }
};

// Компонент для отображения ошибок
const ErrorFallback = ({ onClose, message }: { onClose: () => void, message: string }) => {
  React.useEffect(() => {
    toast.error(message);
  }, [message]);
  
  return (
    <div className="p-4 text-center">
      <p className="text-red-500 mb-4">{message}</p>
      <Button onClick={onClose}>Закрыть</Button>
    </div>
  );
};

export default React.memo(ProjectDialogContent);
