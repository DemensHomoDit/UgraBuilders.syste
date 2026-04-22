
import { useState } from "react";
import { Project } from "@/types/project"; 
import { toast } from "sonner";
import { useProjectValidation } from "./useProjectValidation";
import { checkAuthAndGetUserId } from "./useAuthCheck";
import { prepareProjectData } from "./project-data";
import { saveOrUpdateProject } from "./useProjectApiOps";

/**
 * Хук для сохранения проекта (создание или редактирование).
 */
export const useProjectSave = (
  initialProject?: Project,
  onSave?: (project: Project) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { validateProject, showValidationErrors } = useProjectValidation();

  const saveProject = async (projectData: Partial<Project>) => {
    // Валидация на клиенте
    const validationErrors = validateProject(projectData);
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return null;
    }

    setIsLoading(true);
    try {
      // Проверяем авторизацию, получаем userId
      const userId = await checkAuthAndGetUserId();
      if (!userId) {
        toast.error("Необходимо авторизоваться для сохранения проекта");
        return null;
      }

      // Преобразуем данные для сохранения
      const dataToSave = prepareProjectData(projectData, userId, { initialProject });
      // Сохраняем или обновляем проект
      const savedProject = await saveOrUpdateProject(initialProject, dataToSave) as Project;
      
      if (savedProject) {
        // Триггерим событие обновления для обновления UI в других компонентах
        const eventType = initialProject?.id ? 'UPDATE' : 'INSERT';
        window.dispatchEvent(new CustomEvent('project-updated', { 
          detail: { project: savedProject, type: eventType }
        }));
        
        // Вызываем колбэк onSave, если он предоставлен
        if (onSave) {
          onSave(savedProject);
        }
      }
      
      return savedProject;
    } catch (error: any) {
      console.error("Ошибка при сохранении проекта:", error);
      toast.error("Ошибка при сохранении проекта", {
        description: error.message || "Неизвестная ошибка"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, saveProject };
};
