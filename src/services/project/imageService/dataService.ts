
import { db } from "@/integrations/db/client";
import type { ProjectImage } from "../types";

export const dataService = {
  async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    try {
      const { data, error } = await db
        .from('project_images')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Преобразуем данные и обеспечиваем правильную типизацию image_type
      return (data || []).map(img => ({
        ...img,
        image_type: (img.image_type as "main" | "general" | "floor_plan") || "general"
      })) as ProjectImage[];
    } catch (error) {
      console.error("Ошибка при получении изображений:", error);
      return [];
    }
  },
  
  // Добавляем метод updateImagesOrder, которого не хватает
  async updateImagesOrder(orderData: { id: string; display_order: number }[]): Promise<boolean> {
    try {
      // Используем транзакцию для обновления порядка
      for (const item of orderData) {
        const { error } = await db
          .from('project_images')
          .update({ display_order: item.display_order })
          .eq('id', item.id);

        if (error) {
          console.error("Ошибка при обновлении порядка изображений:", error);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Ошибка при обновлении порядка изображений:", error);
      return false;
    }
  }
};
