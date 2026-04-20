
import { db } from "@/integrations/db/client";

/**
 * Инициализирует бакет для хранения изображений проектов
 * и проверяет наличие политик доступа
 */
export async function initProjectImagesBucket() {
  const bucketName = "project-images-new";
  
  try {
    // Проверяем существование бакета
    const { data: buckets, error: bucketsError } = await db.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Ошибка при получении списка бакетов:", bucketsError);
      return false;
    }
    
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      // Если бакет не существует, используем функцию create_project_images_bucket
      const { data, error } = await db.rpc('create_project_images_bucket');
      
      if (error) {
        console.error("Ошибка при вызове функции создания бакета:", error);
        // Продолжаем работу даже при ошибке, чтобы не блокировать загрузку приложения
      } else {
      }
    } else {
    }
    
    return true;
  } catch (error) {
    // Ловим все возможные ошибки, но не останавливаем загрузку приложения
    console.error("Ошибка при инициализации бакета:", error);
    return false;
  }
}

// Автоматически инициализируем бакет при импорте модуля
// Используем setTimeout, чтобы отложить выполнение и не блокировать загрузку приложения
setTimeout(() => {
  initProjectImagesBucket()
    .then(success => {
      if (success) {
      } else {
        console.warn("Не удалось инициализировать бакет, но приложение продолжит работу");
      }
    })
    .catch(error => {
      console.error("Ошибка при инициализации бакета:", error);
    });
}, 1000);
