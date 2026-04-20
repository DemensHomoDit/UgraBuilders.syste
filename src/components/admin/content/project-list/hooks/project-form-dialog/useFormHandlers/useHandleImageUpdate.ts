
import { useCallback } from "react";
import { toast } from "sonner";
import { ProjectImage } from "@/services/project/types";
import projectService from "@/services/project/index";

export function useHandleImageUpdate(
  safeSetState: <T extends any>(setter: React.Dispatch<React.SetStateAction<T>>, value: React.SetStateAction<T>) => void,
  setPreventClose: React.Dispatch<React.SetStateAction<boolean>>,
  setProjectImages: React.Dispatch<React.SetStateAction<ProjectImage[]>>
) {
  return useCallback(async (imageId: string, data: Partial<ProjectImage>): Promise<void> => {
    try {
      safeSetState(setPreventClose, true);

      if ('description' in data) {
        const success = await projectService.updateImageDescription(imageId, data.description || '');

        if (success) {
          safeSetState(setProjectImages, prev =>
            prev.map(img => img.id === imageId ? { ...img, description: data.description || '' } : img)
          );
          toast.success("Описание изображения обновлено");
        } else {
          throw new Error("Не удалось обновить описание");
        }
      }
    } catch (error) {
      console.error("Ошибка при обновлении изображения:", error);
      toast.error("Не удалось обновить изображение");
    } finally {
      setTimeout(() => {
        safeSetState(setPreventClose, false);
      }, 500);
    }
  }, [safeSetState, setPreventClose, setProjectImages]);
}
