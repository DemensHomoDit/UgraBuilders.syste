
import { useCallback } from "react";
import { toast } from "sonner";
import { Project, ProjectImage } from "@/services/project/types";
import projectService from "@/services/project/index";

export function useHandleImageAdd(
  selectedProject: Project | null,
  savedProject: Project | null,
  safeSetState: <T extends any>(setter: React.Dispatch<React.SetStateAction<T>>, value: React.SetStateAction<T>) => void,
  setPreventClose: React.Dispatch<React.SetStateAction<boolean>>,
  setProjectImages: React.Dispatch<React.SetStateAction<ProjectImage[]>>
) {
  return useCallback(async (image: ProjectImage): Promise<void> => {
    const projectId = selectedProject?.id || savedProject?.id;
    if (!projectId) {
      toast.error("ID проекта не указан");
      return Promise.reject(new Error("ID проекта не указан"));
    }

    try {
      safeSetState(setPreventClose, true);

      console.debug("Adding image to project:", projectId, image);

      const savedImage = await projectService.addProjectImage(
        projectId,
        image.image_url,
        image.description || "",
        image.image_type || "general"
      );

      if (savedImage) {
        console.debug("Image successfully added:", savedImage);

        const typedImage: ProjectImage = {
          id: savedImage.id,
          project_id: savedImage.project_id,
          image_url: savedImage.image_url,
          description: savedImage.description || "",
          display_order: savedImage.display_order,
          created_at: savedImage.created_at,
          image_type: savedImage.image_type || "general"
        };

        safeSetState(setProjectImages, prev => [...prev, typedImage]);
        toast.success("Изображение успешно добавлено");
        return Promise.resolve();
      } else {
        console.error("Failed to save image: No image returned from service");
        throw new Error("Не удалось сохранить изображение");
      }
    } catch (error) {
      console.error("Ошибка при добавлении изображения:", error);
      toast.error("Не удалось добавить изображение");
      return Promise.reject(error);
    } finally {
      setTimeout(() => {
        safeSetState(setPreventClose, false);
      }, 500);
    }
  }, [selectedProject?.id, savedProject?.id, safeSetState, setPreventClose, setProjectImages]);
}
