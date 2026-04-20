
import projectService, { Project, ProjectImage, Category } from "./project";
import projectDeleteService from "./project/projectDeleteService";

// Расширяем экспортируемый объект, добавляя метод deleteProject
export default {
  ...projectService,
  deleteProject: projectDeleteService.deleteProject
};

export type { Project, ProjectImage, Category };
