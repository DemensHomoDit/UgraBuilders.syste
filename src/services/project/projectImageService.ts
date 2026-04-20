import { db } from "@/integrations/db/client";
import { ProjectImage } from "./types";
import { toast } from "sonner";

/**
 * Сервис для работы с изображениями проектов
 */
class ProjectImageService {
  /**
   * Получает список изображений проекта
   * @param projectId ID проекта
   * @returns Массив изображений
   */
  async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    try {
      // Запрашиваем все изображения проекта, отсортированные по порядку отображения
      const { data, error } = await db
        .from('project_images')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error("Ошибка загрузки изображений проекта:", error);
        toast.error("Не удалось загрузить изображения проекта");
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }
      // Проверяем изображения на доступность
      const enhancedImages = data.map(image => ({
        ...image,
        image_url: image.image_url || '',
        image_type: (image.image_type as "main" | "general" | "floor_plan") || "general",
        description: image.description || '',
        display_order: image.display_order || 0
      }));

      return enhancedImages as ProjectImage[];
    } catch (error: any) {
      console.error("Ошибка при получении изображений проекта:", error);
      toast.error("Ошибка при загрузке изображений проекта");
      return [];
    }
  }

  /**
   * Добавляет новое изображение к проекту
   * @param projectId ID проекта
   * @param imageUrl URL изображения
   * @param description Описание изображения
   * @param imageType Тип изображения (main, general, floor_plan)
   * @returns Добавленное изображение или null
   */
  async addProjectImage(
    projectId: string, 
    imageUrl: string, 
    description: string = "",
    imageType: "main" | "general" | "floor_plan" = "general"
  ): Promise<ProjectImage | null> {
    try {
      // Проверяем URL изображения
      if (!imageUrl || !imageUrl.trim()) {
        console.error("Ошибка: URL изображения не указан");
        toast.error("URL изображения не может быть пустым");
        return null;
      }
      // Получаем максимальный порядковый номер
      const { data: orderData } = await db
        .from('project_images')
        .select('display_order')
        .eq('project_id', projectId)
        .order('display_order', { ascending: false })
        .limit(1);
      const nextOrder = orderData && orderData.length > 0 ? (orderData[0].display_order || 0) + 1 : 0;
      // Всегда используем обычный insert с image_type
      const insertResult = await db
        .from('project_images')
        .insert([
          { 
            project_id: projectId, 
            image_url: imageUrl, 
            description: description,
            display_order: nextOrder,
            image_type: imageType
          }
        ])
        .select()
        .single();
      if (insertResult.error) {
        console.error("Ошибка вставки изображения:", insertResult.error);
        toast.error("Не удалось добавить изображение проекта");
        return null;
      }
      toast.success("Изображение проекта добавлено");
      return insertResult.data as ProjectImage;
    } catch (error: any) {
      console.error("Ошибка при добавлении изображения проекта:", error);
      toast.error("Ошибка при добавлении изображения");
      return null;
    }
  }

  /**
   * Обновляет описание изображения
   * @param imageId ID изображения
   * @param description Новое описание
   * @param imageType Тип изображения (опционально)
   * @returns true в случае успеха, false в случае ошибки
   */
  async updateImageDescription(
    imageId: string, 
    description: string,
    imageType?: "main" | "general" | "floor_plan"
  ): Promise<boolean> {
    try {
      const updateData: { description: string; image_type?: "main" | "general" | "floor_plan" } = { 
        description 
      };
      
      // Добавляем тип изображения только если он передан
      if (imageType) {
        updateData.image_type = imageType;
      }
      
      const { error } = await db
        .from('project_images')
        .update(updateData)
        .eq('id', imageId);

      if (error) {
        console.error("Ошибка обновления описания изображения:", error);
        toast.error("Не удалось обновить описание изображения");
        return false;
      }

      toast.success("Описание изображения обновлено");
      return true;
    } catch (error: any) {
      console.error("Ошибка при обновлении описания изображения:", error);
      toast.error("Ошибка при обновлении описания");
      return false;
    }
  }

  /**
   * Удаляет изображение проекта
   * @param imageId ID изображения
   * @returns true в случае успеха, false в случае ошибки
   */
  async deleteProjectImage(imageId: string): Promise<boolean> {
    try {
      const { error } = await db
        .from('project_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        console.error("Ошибка удаления изображения проекта:", error);
        toast.error("Не удалось удалить изображение проекта");
        return false;
      }

      toast.success("Изображение проекта удалено");
      return true;
    } catch (error: any) {
      console.error("Ошибка при удалении изображения проекта:", error);
      toast.error("Ошибка при удалении изображения");
      return false;
    }
  }

  /**
   * Обновляет порядок отображения изображений
   * @param orderData Массив объектов с id и display_order
   * @returns true в случае успеха, false в случае ошибки
   */
  async updateImagesOrder(
    orderData: { id: string; display_order: number }[]
  ): Promise<boolean> {
    try {
      // Используем транзакцию для обновления порядка
      for (const item of orderData) {
        const { error } = await db
          .from('project_images')
          .update({ display_order: item.display_order })
          .eq('id', item.id);

        if (error) {
          console.error("Ошибка обновления порядка изображения:", error);
          return false;
        }
      }

      toast.success("Порядок изображений обновлен");
      return true;
    } catch (error: any) {
      console.error("Ошибка при обновлении порядка изображений:", error);
      toast.error("Ошибка при обновлении порядка");
      return false;
    }
  }
}

export default new ProjectImageService();
