
import { Project } from "@/types/project";

export const processBooleanFields = (data: Partial<Project>): Partial<Project> => {
  return {
    ...data,
    hasgarage: data.hasgarage === undefined ? false : Boolean(data.hasgarage),
    hasterrace: data.hasterrace === undefined ? false : Boolean(data.hasterrace),
    is_published: Boolean(data.is_published)
  };
};
