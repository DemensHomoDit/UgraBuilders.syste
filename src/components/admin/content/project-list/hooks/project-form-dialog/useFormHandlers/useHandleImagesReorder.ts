
import { useCallback } from "react";
import { toast } from "sonner";
import { ProjectImage } from "@/services/project/types";
import projectService from "@/services/project/index";

export function useHandleImagesReorder(
  safeSetState: <T extends any>(setter: React.Dispatch<React.SetStateAction<T>>, value: React.SetStateAction<T>) => void,
  setPreventClose: React.Dispatch<React.SetStateAction<boolean>>,
  setProjectImages: React.Dispatch<React.SetStateAction<ProjectImage[]>>
) {
  return useCallback(async (reorderedImages: ProjectImage[]): Promise<void> => {
    try {
      safeSetState(setPreventClose, true);

      const orderData = reorderedImages.map((img, index) => ({
        id: img.id,
        display_order: index
      }));

      const success = await projectService.updateImagesOrder(orderData);

      if (success) {
        safeSetState(setProjectImages, reorderedImages);
        toast.success("Порядок изображений обновлен");
      } else {
        throw new Error("Ошибка при обновлении порядка изображений");
      }
    } catch (error) {
      console.error("Ошибка при обновлении порядка изображений:", error);
      toast.error("Не удалось обновить порядок изображений");
    } finally {
      setTimeout(() => {
        safeSetState(setPreventClose, false);
      }, 500);
    }
  }, [safeSetState, setPreventClose, setProjectImages]);
}
