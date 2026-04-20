
import { db } from "@/integrations/db/client";
import { dataService } from "./dataService";
import { uploadService } from "./uploadService";
import { storageUtils } from "./storageUtils";
import type { ProjectImage, ImageOrder } from "./types";

/**
 * Сервис для работы с изображениями проектов
 */
class ProjectImageService {
  private bucketName = "project-images-new";
  
  constructor() {
  }
  
  /**
   * Получение всех изображений проекта
   */
  public getProjectImages = dataService.getProjectImages;
  
  /**
   * Добавление изображения проекта
   */
  public async addProjectImage(
    projectId: string, 
    imageUrl: string, 
    description: string = "",
    imageType: "main" | "general" | "floor_plan" = "general"
  ): Promise<ProjectImage | null> {
    try {
      // Получаем следующий порядковый номер для нового изображения
      const { data: existingImages } = await db
        .from('project_images')
        .select('display_order')
        .eq('project_id', projectId)
        .order('display_order', { ascending: false })
        .limit(1);
      
      const nextOrder = existingImages && existingImages.length > 0 ? 
        (existingImages[0].display_order || 0) + 1 : 0;
      
      // Добавляем изображение напрямую через интерфейс Supabase
      const { data, error } = await db
        .from('project_images')
        .insert({
          project_id: projectId,
          image_url: imageUrl,
          description: description,
          display_order: nextOrder,
          image_type: imageType // Убедимся, что значение соответствует типу
        })
        .select('*')
        .single();
      
      if (error) {
        console.error("Supabase error adding project image:", error);
        throw error;
      }
      // Преобразуем в нужный формат
      const typedImage: ProjectImage = {
        id: data.id,
        project_id: data.project_id,
        image_url: data.image_url,
        description: data.description,
        display_order: data.display_order || 0,
        created_at: data.created_at || new Date().toISOString(),
        image_type: data.image_type as "main" | "general" | "floor_plan"
      };
      
      return typedImage;
    } catch (error: any) {
      console.error("Ошибка при добавлении изображения проекта:", error);
      return null;
    }
  }
  
  /**
   * Обновление описания изображения проекта
   */
  public async updateImageDescription(
    id: string, 
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
        .eq('id', id);
      
      if (error) {
        console.error("Supabase error updating image description:", error);
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error("Ошибка при обновлении описания изображения:", error);
      return false;
    }
  }
  
  /**
   * Удаление изображения проекта
   */
  public async deleteProjectImage(id: string): Promise<boolean> {
    try {
      // Сначала получаем URL изображения для удаления из хранилища
      const { data: image, error: fetchError } = await db
        .from('project_images')
        .select('image_url')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Удаляем запись из базы данных
      const { error } = await db
        .from('project_images')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Пробуем удалить файл из хранилища (не блокируем операцию при ошибке)
      try {
        if (image?.image_url) {
          await storageUtils.deleteFile(image.image_url);
        }
      } catch (storageError) {
        console.warn("Не удалось удалить файл из хранилища:", storageError);
      }
      
      return true;
    } catch (error: any) {
      console.error("Ошибка при удалении изображения проекта:", error);
      return false;
    }
  }
  
  /**
   * Обновление порядка отображения изображений
   */
  public updateImagesOrder = dataService.updateImagesOrder;
  
  /**
   * Загрузка изображения в хранилище
   */
  public async uploadProjectImageToStorage(file: File, folderPath?: string): Promise<string | null> {
    return uploadService.uploadFile(file, this.bucketName, folderPath);
  }
}

const projectImageService = new ProjectImageService();
export default projectImageService;
export type { ImageOrder, ProjectImage };
