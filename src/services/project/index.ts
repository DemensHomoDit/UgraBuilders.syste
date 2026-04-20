// Объединенный сервис для работы с проектами
import projectQueryService from './projectQueryService';
import { createProject } from './projectCreateService';
import projectUpdateService from './projectUpdateService';
import projectDeleteService from './projectDeleteService';
import projectImageService from './projectImageService';
import { Project, ProjectImage, Category } from './types';

/**
 * Унифицированный сервис для управления проектами
 */
const projectService = {
  // Методы запросов из projectQueryService
  getProjects: projectQueryService.getProjects,
  getProjectsByCategory: projectQueryService.getProjectsByCategory, 
  getProjectsByType: projectQueryService.getProjectsByType,
  getProjectById: projectQueryService.getProjectById,
  
  // Методы мутаций из отдельных сервисов
  createProject,
  updateProject: projectUpdateService.updateProject,
  deleteProject: projectDeleteService.deleteProject,
  updateProjectStatus: projectUpdateService.updateProjectStatus,
  
  // Методы работы с изображениями
  getProjectImages: projectImageService.getProjectImages,
  addProjectImage: projectImageService.addProjectImage,
  updateImageDescription: projectImageService.updateImageDescription,
  deleteProjectImage: projectImageService.deleteProjectImage,
  updateImagesOrder: projectImageService.updateImagesOrder
};

export default projectService;
export type { Project, ProjectImage, Category };
