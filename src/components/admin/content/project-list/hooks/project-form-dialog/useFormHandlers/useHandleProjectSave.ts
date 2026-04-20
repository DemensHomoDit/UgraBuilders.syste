
import { useCallback } from "react";
import { Project } from "@/types/project";
import { toast } from "sonner";
import { processProjectNumericFields } from "@/components/admin/content/project-form/hooks/project-data/numericDataProcessor";

export const useHandleProjectSave = ({
  selectedProject,
  safeSetState,
  setSavedProject,
  setActiveTab
}: {
  selectedProject: Project | null;
  safeSetState: <T extends any>(setter: React.Dispatch<React.SetStateAction<T>>, value: React.SetStateAction<T>) => void;
  setSavedProject: React.Dispatch<React.SetStateAction<Project | null>>;
  setActiveTab: (tab: string) => void;
}) => {
  return useCallback(async (project: Project) => {
    try {
      // Обрабатываем числовые поля с использованием единой функции
      const processedProject = processProjectNumericFields(project);

      // Логируем обработанные числовые поля для отладки
      // Обновляем локальное состояние
      safeSetState(setSavedProject, processedProject);
      
      // После сохранения переключаемся на вкладку images, если это новый проект
      if (!selectedProject?.id && processedProject.id) {
        safeSetState(setActiveTab, "images");
      }
      
      // Логируем успешное сохранение и показываем уведомление
      toast.success("Project saved successfully");

      return processedProject;
    } catch (error) {
      console.error("Error in handleProjectSave:", error);
      toast.error("Error saving project");
      return null;
    }
  }, [selectedProject, safeSetState, setSavedProject, setActiveTab]);
};
