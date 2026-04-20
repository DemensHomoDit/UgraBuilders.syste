import { Project } from "@/types/project";
import { toast } from "sonner";

export const useProjectValidation = () => {
  const validateProject = (projectData: Partial<Project>): string[] => {
    const errors: string[] = [];

    if (!projectData.title?.trim()) {
      errors.push("Название проекта обязательно для заполнения");
    }

    if (projectData.areavalue !== null && projectData.areavalue !== undefined) {
      if (isNaN(Number(projectData.areavalue)) || Number(projectData.areavalue) <= 0) {
        errors.push("Площадь должна быть положительным числом");
      }
    } else {
      errors.push("Площадь обязательна для заполнения");
    }

    if (projectData.pricevalue !== null && projectData.pricevalue !== undefined) {
      if (isNaN(Number(projectData.pricevalue)) || Number(projectData.pricevalue) <= 0) {
        errors.push("Цена должна быть положительным числом");
      }
    } else {
      errors.push("Стоимость обязательна для заполнения");
    }

    if (projectData.is_published && !projectData.cover_image) {
      errors.push("Для публикации проекта необходимо добавить обложку");
    }

    if (projectData.bedrooms !== undefined && projectData.bedrooms < 0) {
      errors.push("Количество спален не может быть отрицательным");
    }

    if (projectData.bathrooms !== undefined && projectData.bathrooms < 0) {
      errors.push("Количество санузлов не может быть отрицательным");
    }

    if (projectData.stories !== undefined && projectData.stories < 1) {
      errors.push("Количество этажей должно быть не менее 1");
    }

    return errors;
  };

  const showValidationErrors = (errors: string[]) => {
    if (errors.length > 0) {
      errors.forEach((error) => {
        toast.error(error);
      });
    }
  };

  return { validateProject, showValidationErrors };
};
