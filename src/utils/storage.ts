
import { db } from "@/integrations/db/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Утилита для работы с хранилищем Supabase
 */
export const storageUtils = {
  /**
   * Загрузка файла в хранилище Supabase
   * @param file Файл для загрузки
   * @param bucketName Имя бакета в хранилище
   * @param folderPath Опциональный путь к папке внутри бакета
   */
  async uploadFile(
    file: File, 
    bucketName: string = "project-images", 
    folderPath: string = ""
  ): Promise<{ url: string | null; error: Error | null }> {
    try {
      // Генерируем уникальное имя файла с использованием UUID
      const fileExt = file.name.split('.').pop();
      const fileName = `${folderPath ? `${folderPath}/` : ''}${uuidv4()}.${fileExt}`;
      
      // Загружаем файл в хранилище
      const { data, error } = await db.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Получаем публичный URL файла
      const { data: urlData } = db.storage
        .from(bucketName)
        .getPublicUrl(data?.path || '');
      
      return { url: urlData.publicUrl, error: null };
    } catch (error) {
      console.error("Ошибка загрузки файла:", error);
      return { url: null, error: error as Error };
    }
  },
  
  /**
   * Удаление файла из хранилища Supabase
   * @param fileUrl URL файла для удаления
   * @param bucketName Имя бакета в хранилище
   */
  async deleteFile(
    fileUrl: string, 
    bucketName: string = "project-images"
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Извлекаем путь к файлу из URL
      const fileUrlObj = new URL(fileUrl);
      const pathParts = fileUrlObj.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf(bucketName) + 1).join('/');
      
      // Удаляем файл из хранилища
      const { error } = await db.storage
        .from(bucketName)
        .remove([filePath]);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Ошибка удаления файла:", error);
      return { success: false, error: error as Error };
    }
  }
};
