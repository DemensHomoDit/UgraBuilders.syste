
/**
 * Этот файл оставлен для обратной совместимости
 * и будет удален в будущих версиях
 */
import { createProject } from "./projectCreateService";
import projectUpdateService from "./projectUpdateService";
import projectDeleteService from "./projectDeleteService";
import { Project } from "./types";

/**
 * @deprecated Используйте отдельные сервисы вместо этого
 */
class ProjectMutationService {
  /**
   * Создает новый проект
   * @param project Данные проекта
   * @returns Созданный проект или null
   */
  public async createProject(project: Project): Promise<Project | null> {
    return createProject(project);
  }
  
  /**
   * Обновляет существующий проект
   * @param id ID проекта
   * @param projectData Данные для обновления
   * @returns Обновленный проект или null
   */
  public async updateProject(id: string, projectData: Partial<Project>): Promise<Project | null> {
    return projectUpdateService.updateProject(id, projectData);
  }
  
  /**
   * Удаляет проект
   * @param id ID проекта
   * @returns true в случае успеха, false в случае ошибки
   */
  public async deleteProject(id: string): Promise<boolean> {
    return projectDeleteService.deleteProject(id);
  }
}

export default new ProjectMutationService();
