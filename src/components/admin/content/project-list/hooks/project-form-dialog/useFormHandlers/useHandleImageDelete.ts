
import { useCallback } from "react";
import { toast } from "sonner";
import { ProjectImage } from "@/services/project/types";
import projectService from "@/services/project/index";

export function useHandleImageDelete(
  safeSetState: <T extends any>(setter: React.Dispatch<React.SetStateAction<T>>, value: React.SetStateAction<T>) => void,
  setPreventClose: React.Dispatch<React.SetStateAction<boolean>>,
  setProjectImages: React.Dispatch<React.SetStateAction<ProjectImage[]>>
) {
  return useCallback(async (imageId: string): Promise<boolean> => {
    try {
      safeSetState(setPreventClose, true);

      const success = await projectService.deleteProjectImage(imageId);

      if (success) {
        safeSetState(setProjectImages, prev => prev.filter(img => img.id !== imageId));
        toast.success("Изображение удалено");
        return true;
      } else {
        throw new Error("Ошибка при удалении изображения");
      }
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
      toast.error("Не удалось удалить изображение");
      return false;
    } finally {
      setTimeout(() => {
        safeSetState(setPreventClose, false);
      }, 500);
    }
  }, [safeSetState, setPreventClose, setProjectImages]);
}
