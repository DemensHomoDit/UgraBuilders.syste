import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE ?? "";

/**
 * Сервис для отправки уведомлений через API
 */
class NotificationService {
  /**
   * Отправить уведомление об изменении статуса проекта
   * @param userId ID пользователя, которому отправляется уведомление
   * @param projectId ID проекта
   * @param projectTitle Название проекта
   * @param status Новый статус проекта
   */
  async notifyProjectStatusChange(userId: string, projectId: string, projectTitle: string, status: string): Promise<boolean> {
    return this.sendRequest('/api/notifications/project-status', {
      userId, 
      projectId,
      projectTitle,
      status
    });
  }

  /**
   * Уведомить клиента об изменении этапа продажи
   * @param userId ID пользователя (клиента)
   * @param stage Новый этап продажи
   */
  async notifyClientSaleStageChange(userId: string, stage: string): Promise<boolean> {
    return this.sendRequest('/api/notifications/client-stage', {
      userId, 
      stage
    });
  }

  /**
   * Уведомить клиента об изменении этапа строительства
   * @param userId ID пользователя (клиента)
   * @param stage Новый этап строительства
   */
  async notifyConstructionStageChange(userId: string, stage: string): Promise<boolean> {
    return this.sendRequest('/api/notifications/construction-stage', {
      userId, 
      stage
    });
  }

  /**
   * Уведомить о новой задаче
   * @param userId ID пользователя
   * @param task Данные о задаче
   */
  async notifyNewTask(userId: string, task: { task: string, date: string, assignedTo?: string }): Promise<boolean> {
    return this.sendRequest('/api/notifications/task', {
      userId, 
      task
    });
  }

  /**
   * Уведомить о загрузке документа
   * @param userId ID пользователя
   * @param fileName Имя файла
   * @param fileType Тип файла ('documents', 'contracts', etc.)
   */
  async notifyDocumentUploaded(userId: string, fileName: string, fileType: string): Promise<boolean> {
    return this.sendRequest('/api/notifications/document', {
      userId, 
      fileName,
      fileType
    });
  }

  /**
   * Отправить произвольное уведомление
   * @param userId ID пользователя
   * @param title Заголовок уведомления
   * @param body Текст уведомления
   */
  async sendCustomNotification(userId: string, title: string, body: string): Promise<boolean> {
    return this.sendRequest('/api/notifications/custom', {
      userId, 
      title,
      body
    });
  }

  /**
   * Внутренний метод для отправки запросов на сервер уведомлений
   */
  private async sendRequest(endpoint: string, data: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Ошибка при отправке уведомления (${response.status}):`, errorText);
        return false;
      }
      
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('Ошибка при отправке уведомления:', error);
      return false;
    }
  }
}

export default new NotificationService(); 
