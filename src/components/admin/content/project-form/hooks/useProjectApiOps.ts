import { db } from "@/integrations/db/client";
import { Project } from "@/types/project";
import { toast } from "sonner";
import { processProjectNumericFields } from "./project-data/numericDataProcessor";

/**
 * Сохраняет или обновляет проект в базе данных
 */
export const saveOrUpdateProject = async (
  initialProject: Project | undefined,
  projectData: Partial<Project>
): Promise<Project | null> => {
  try {
    // Проверка наличия обязательного поля title
    if (!projectData.title) {
      throw new Error("Название проекта обязательно для заполнения");
    }

    // Обрабатываем числовые поля для корректного сохранения в базе данных
    const processedData = processProjectNumericFields(projectData);
    if (initialProject?.id) {
      // Обновляем существующий проект
      const safeCategoryId = processedData.category_id && typeof processedData.category_id === 'string' && processedData.category_id.length > 0 ? processedData.category_id : null;
      const { data, error } = await db
        .from("projects")
        .update({
          title: processedData.title,
          description: processedData.description || '',
          content: processedData.content || '',
          cover_image: processedData.cover_image || '',
          category_id: safeCategoryId,
          tags: processedData.tags || [],
          areavalue: processedData.areavalue,
          pricevalue: processedData.pricevalue,
          dimensions: processedData.dimensions || '',
          bedrooms: processedData.bedrooms,
          bathrooms: processedData.bathrooms,
          stories: processedData.stories,
          hasgarage: processedData.hasgarage,
          hasterrace: processedData.hasterrace,
          material: processedData.material || 'Каркасный дом',
          type: processedData.type || 'standard',
          style: processedData.style || 'classic',
          is_published: processedData.is_published,
          designer_first_name: processedData.designer_first_name || '',
          designer_last_name: processedData.designer_last_name || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', initialProject.id)
        .select();
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("Не удалось получить обновленные данные проекта");
      }
      toast.success("Проект успешно обновлен");
      
      // Вызываем событие обновления проекта для реактивного обновления UI
      window.dispatchEvent(new CustomEvent('project-updated', { 
        detail: { project: data[0], type: 'UPDATE' }
      }));
      
      return data[0] as Project;
    } else {
      // Создаем новый проект
      const safeCategoryId = processedData.category_id && typeof processedData.category_id === 'string' && processedData.category_id.length > 0 ? processedData.category_id : null;
      const { data, error } = await db
        .from("projects")
        .insert({
          title: processedData.title,
          description: processedData.description || '',
          content: processedData.content || '',
          cover_image: processedData.cover_image || '',
          category_id: safeCategoryId,
          tags: processedData.tags || [],
          areavalue: processedData.areavalue,
          pricevalue: processedData.pricevalue,
          dimensions: processedData.dimensions || '',
          bedrooms: processedData.bedrooms,
          bathrooms: processedData.bathrooms,
          stories: processedData.stories,
          hasgarage: processedData.hasgarage,
          hasterrace: processedData.hasterrace,
          material: processedData.material || 'Каркасный дом',
          type: processedData.type || 'standard',
          style: processedData.style || 'classic',
          is_published: processedData.is_published || false,
          designer_first_name: processedData.designer_first_name || '',
          designer_last_name: processedData.designer_last_name || '',
        })
        .select();
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("Не удалось получить данные созданного проекта");
      }
      toast.success("Новый проект успешно создан");
      
      // Вызываем событие добавления проекта для реактивного обновления UI
      window.dispatchEvent(new CustomEvent('project-updated', { 
        detail: { project: data[0], type: 'INSERT' }
      }));
      
      return data[0] as Project;
    }
  } catch (error: any) {
    console.error("Ошибка при сохранении проекта:", error);
    toast.error("Не удалось сохранить проект", { 
      description: error.message || "Неизвестная ошибка" 
    });
    return null;
  }
};
