
import { db } from "@/integrations/db/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Сервис для загрузки файлов в хранилище
 */
export const uploadService = {
  /**
   * Компрессия изображения перед загрузкой
   */
  async compressImage(file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.85): Promise<File> {
    // Если файл не является изображением или меньше 1MB, возвращаем как есть
    if (!file.type.startsWith('image/') || file.size < 1024 * 1024) {
      return file;
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Определяем новые размеры с сохранением пропорций
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
          
          // Создаем canvas для рисования уменьшенного изображения
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.warn('Не удалось получить 2d контекст для canvas, возвращаем оригинал');
            resolve(file);
            return;
          }
          
          // Для изображений с прозрачностью (PNG) добавляем белый фон
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          
          // Рисуем изображение на canvas
          ctx.drawImage(img, 0, 0, width, height);
          
          // Прогрессивное сжатие для больших файлов
          const tryCompression = (currentQuality: number) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  console.warn('Не удалось преобразовать canvas в blob, возвращаем оригинал');
                  resolve(file);
                  return;
                }
                
                // Создаем новый File из полученного Blob
                const compressedFile = new File(
                  [blob], 
                  file.name, 
                  { 
                    type: 'image/jpeg', 
                    lastModified: Date.now() 
                  }
                );
                // Если файл все еще слишком большой и качество можно еще уменьшить
                if (compressedFile.size > 4 * 1024 * 1024 && currentQuality > 0.5) {
                  tryCompression(Math.max(0.5, currentQuality - 0.1));
                } else {
                  resolve(compressedFile);
                }
              },
              'image/jpeg',
              currentQuality
            );
          };
          
          // Начинаем с указанного качества
          tryCompression(quality);
        };
        
        img.onerror = () => {
          console.warn('Ошибка при загрузке изображения для сжатия, возвращаем оригинал');
          resolve(file);
        };
      };
      
      reader.onerror = () => {
        console.warn('Ошибка при чтении файла для сжатия, возвращаем оригинал');
        resolve(file);
      };
    });
  },

  /**
   * Загрузка файла в хранилище с оптимизацией и обработкой таймаутов
   */
  async uploadFile(file: File, bucketName: string, folderPath?: string): Promise<string | null> {
    try {
      // Компрессия изображения перед загрузкой
      let fileToUpload = file;
      if (file.type.startsWith('image/') && file.size > 1024 * 1024) {
        fileToUpload = await this.compressImage(file);
      }
      
      // Создаем уникальное имя файла
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${Date.now()}-${uuidv4()}.${fileExt}`;
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
      
      // Проверяем существование бакета и создаем, если нужно
      await db.rpc('verify_project_images_bucket');
      
      // Механизм повторных попыток
      let attempts = 0;
      const maxAttempts = 3;
      let lastError: any = null;
      
      while (attempts < maxAttempts) {
        attempts++;
        
        try {
          // Загружаем файл с явным указанием Content-Type
          const { data, error } = await db.storage
            .from(bucketName)
            .upload(filePath, fileToUpload, {
              cacheControl: '3600',
              upsert: true,
              contentType: fileToUpload.type
            });
          
          if (error) {
            console.error(`Ошибка загрузки файла (попытка ${attempts}/${maxAttempts}):`, error);
            lastError = error;
            
            // Если это не последняя попытка, ждем перед следующей
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            } else {
              throw error;
            }
          }
          
          // Получаем публичный URL
          const { data: urlData } = db.storage
            .from(bucketName)
            .getPublicUrl(data.path);
          return urlData.publicUrl;
        } catch (error: any) {
          console.error(`Ошибка загрузки (попытка ${attempts}/${maxAttempts}):`, error);
          lastError = error;
          
          // Если это не последняя попытка, ждем перед следующей
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      // Если все попытки неудачны
      if (lastError) {
        throw lastError;
      }
      
      return null; // Никогда не должны дойти сюда, но TypeScript требует возврата
    } catch (error: any) {
      console.error("Итоговая ошибка загрузки файла:", error);
      return null;
    }
  }
};
