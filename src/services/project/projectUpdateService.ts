import { db } from "@/integrations/db/client";
import { toast } from "sonner";
import { Project } from "./types";
import { processProjectNumericFields } from "@/components/admin/content/project-form/hooks/project-data/numericDataProcessor";
import { withRetry } from "@/utils/retry";
import notificationService from "@/services/notifications/notificationService";

// Интеграция с сервисом уведомлений
const sendStatusNotification = async (userId: string, projectId: string, projectTitle: string, status: string) => {
  try {
    // Используем сервис уведомлений для отправки
    const success = await notificationService.notifyProjectStatusChange(
      userId, projectId, projectTitle, status
    );
    
    return success;
  } catch (error) {
    console.error('Ошибка при отправке уведомления:', error);
    return false;
  }
};

class ProjectUpdateService {
  public async updateProject(id: string, updatedProject: Partial<Project>): Promise<Project | null> {
    return withRetry(async () => {
      try {
        // Process all numeric fields consistently, using the same function as creation
        const processedData = processProjectNumericFields(updatedProject);
        const { data, error } = await db
          .from('projects')
          .update({
            title: processedData.title,
            description: processedData.description,
            content: processedData.content,
            cover_image: processedData.cover_image,
            dimensions: processedData.dimensions || '',
            material: processedData.material || '',
            type: processedData.type || 'standard',
            style: processedData.style || 'classic',
            designer_first_name: processedData.designer_first_name || '',
            designer_last_name: processedData.designer_last_name || '',
            areavalue: processedData.areavalue !== undefined && processedData.areavalue !== null 
              ? Number(processedData.areavalue) : null,
            pricevalue: processedData.pricevalue !== undefined && processedData.pricevalue !== null 
              ? (typeof processedData.pricevalue === 'string' 
                 ? parseFloat(String(processedData.pricevalue).replace(/[^\d.-]/g, ''))
                 : Number(processedData.pricevalue)) 
              : null,
            bedrooms: processedData.bedrooms !== undefined && processedData.bedrooms !== null 
              ? Number(processedData.bedrooms) : 0,
            bathrooms: processedData.bathrooms !== undefined && processedData.bathrooms !== null 
              ? Number(processedData.bathrooms) : 0,
            stories: processedData.stories !== undefined && processedData.stories !== null 
              ? Number(processedData.stories) : 1,
            hasgarage: processedData.hasgarage !== undefined ? Boolean(processedData.hasgarage) : false,
            hasterrace: processedData.hasterrace !== undefined ? Boolean(processedData.hasterrace) : false,
            is_published: processedData.is_published !== undefined ? Boolean(processedData.is_published) : false,
            category_id: processedData.category_id,
            tags: processedData.tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select();
        
        if (error) {
          throw new Error(error.message);
        }

        if (!data || data.length === 0) {
          throw new Error("Ошибка обновления проекта: данные не возвращены");
        }
        toast.success("Проект успешно обновлен");
        return data[0];
      } catch (error: any) {
        console.error("Error in updateProject (retry):", error);
        throw error;
      }
    }, {
      onError: (error) => {
        toast.error(`Ошибка при обновлении проекта: ${error?.message || "Неизвестная ошибка"}`);
      }
    });
  }

  /**
   * Обновить статус workflow проекта (draft, pending, published, rejected)
   */
  public async updateProjectStatus(id: string, status: 'draft' | 'pending' | 'published' | 'rejected'): Promise<Project | null> {
    return withRetry(async () => {
      try {
        const { data, error } = await db
          .from('projects')
          .update({
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select();
        
        if (error) {
          throw new Error(error.message);
        }
        if (!data || data.length === 0) {
          throw new Error('Ошибка обновления статуса проекта: данные не возвращены');
        }
        
        // Отправить уведомление о смене статуса проекта
        if (data[0].created_by) {
          try {
            sendStatusNotification(
              data[0].created_by, 
              data[0].id, 
              data[0].title || 'Без названия', 
              status
            );
          } catch (notifyError) {
            console.error('Ошибка при отправке уведомления:', notifyError);
          }
        }
        
        toast.success(`Статус проекта обновлён: ${status}`);
        return data[0];
      } catch (error: any) {
        console.error('Error in updateProjectStatus (retry):', error);
        throw error;
      }
    }, {
      onError: (error) => {
        toast.error(`Ошибка при обновлении статуса проекта: ${error?.message || 'Неизвестная ошибка'}`);
      }
    });
  }
}

export default new ProjectUpdateService();
