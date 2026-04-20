
import { Project } from "@/types/project";

export const setDefaultValues = (data: Partial<Project>): Partial<Project> => {
  const processed = { ...data };
  
  // Set default style if not present
  if (!processed.style) {
    processed.style = "classic";
  }
  
  // Ensure tags is always an array
  if (processed.tags === undefined) {
    processed.tags = [];
  }
  
  return processed;
};
