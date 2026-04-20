
import { db } from "@/integrations/db/client";

/**
 * Вспомогательные функции для работы с хранилищем
 */
export const storageUtils = {
  /**
   * Удаление файла из хранилища по URL
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Извлекаем информацию из URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);
      
      if (pathParts.length < 2) {
        console.error("Неверный формат URL для удаления файла:", fileUrl);
        return false;
      }
      
      // Извлекаем имя бакета и путь к файлу
      const bucketName = pathParts[1];
      const filePath = pathParts.slice(2).join('/');
      
      if (!bucketName || !filePath) {
        console.error("Не удалось определить бакет или путь к файлу:", fileUrl);
        return false;
      }
      
      // Удаляем файл
      const { error } = await db.storage
        .from(bucketName)
        .remove([filePath]);
      
      if (error) {
        console.error("Ошибка при удалении файла из хранилища:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Ошибка при удалении файла:", error);
      return false;
    }
  }
};
