
import { useCallback } from "react";
import { Project } from "@/types/project";
import { toast } from "sonner";

export const useSaveHandler = (
  formData: Partial<Project>,
  isMountedRef: React.MutableRefObject<boolean>,
  saveProject: (projectData: Partial<Project>) => Promise<Project | null>
) => {
  const handleSave = useCallback(async () => {
    try {
      // Проверяем, что компонент все еще смонтирован
      if (!isMountedRef.current) {
        return null;
      }
      // Вызываем функцию сохранения и возвращаем результат
      return await saveProject(formData);
    } catch (error: any) {
      console.error("Ошибка при обработке сохранения:", error);
      toast.error("Произошла ошибка при сохранении");
      return null;
    }
  }, [formData, saveProject, isMountedRef]);

  return {
    handleSave
  };
};
