import { db } from "@/integrations/db/client";
import { toast } from "sonner";
import { withRetry } from "@/utils/retry";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Сервис для удаления проектов
 */
class ProjectDeleteService {
  /**
   * Удаляет проект и все связанные данные
   * @param projectId ID проекта для удаления
   * @returns Успешно ли выполнено удаление
   */
  async deleteProject(projectId: string): Promise<boolean> {
    if (!projectId) {
      console.error("Не указан ID проекта для удаления");
      return false;
    }
    
    return withRetry(async () => {
      try {
        // Используем транзакционную функцию в БД для атомарного удаления
        const { data, error } = await db.rpc('delete_project_transaction', {
          project_id_param: projectId
        });
        
        if (error) {
          console.error("Ошибка при удалении проекта:", error.message);
          throw new Error(error.message);
        }
        // Оповещаем UI об успешном удалении через событие
        window.dispatchEvent(new CustomEvent('project-deleted', { 
          detail: { projectId, success: true }
        }));
        
        return true;
      } catch (error: any) {
        console.error("Непредвиденная ошибка при удалении проекта:", error);
        throw error;
      }
    }, {
      onError: (error) => {
        toast.error(`Не удалось удалить проект: ${error?.message || "Неизвестная ошибка"}`);
      }
    });
  }
}

export default new ProjectDeleteService();
