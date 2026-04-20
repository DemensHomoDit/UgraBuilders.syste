import { db } from "@/integrations/db/client";
import { v4 as uuidv4 } from "uuid";
import ExifReader from "exifreader";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

function getToken(): string {
  try {
    return localStorage.getItem("mongo_auth_token") ?? "";
  } catch {
    return "";
  }
}

/**
 * Утилиты для работы с Supabase Storage
 */
export const supabaseStorage = {
  /**
   * Предварительная обработка изображения перед загрузкой
   * Сохраняет оригинальный формат файла без конвертации
   * @param file Файл изображения для обработки
   * @returns File объект с оптимизированным размером (без изменения формата)
   */
  async compressImage(
    file: File,
    maxWidth = 1920,
    maxHeight = 1080,
  ): Promise<File> {
    // Пропускаем сжатие для не-изображений или маленьких файлов
    if (!file.type.startsWith("image/") || file.size < 1 * 1024 * 1024) {
      return file;
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          // Если изображение меньше максимальных размеров, возвращаем оригинал
          if (
            img.width <= maxWidth &&
            img.height <= maxHeight &&
            file.size < 5 * 1024 * 1024
          ) {
            resolve(file);
            return;
          }

          // Рассчитываем новые размеры с сохранением пропорций
          let width = img.width;
          let height = img.height;

          // Выбираем подходящие размеры на основе размера файла
          if (file.size > 5 * 1024 * 1024) {
            maxWidth = 1600;
            maxHeight = 900;
          } else if (file.size > 10 * 1024 * 1024) {
            maxWidth = 1280;
            maxHeight = 720;
          }

          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }

          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }

          // Создаем canvas для изменения размера (без изменения формата)
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            // Используем белый фон для изображений с прозрачностью
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);

            // Рисуем изображение с правильным сглаживанием
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);

            // Используем оригинальный тип файла для сохранения формата
            const outputType = file.type;

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  // Сохраняем исходное имя файла и расширение
                  const newFilename = file.name;

                  const resizedFile = new File([blob], newFilename, {
                    type: outputType, // Сохраняем оригинальный тип
                    lastModified: Date.now(),
                  });
                  resolve(resizedFile);
                } else {
                  console.warn(
                    "[storage] Обработка не удалась, используем оригинал",
                  );
                  resolve(file);
                }
              },
              outputType,
              0.95,
            ); // Высокое качество для минимальной потери данных
          } else {
            console.warn("[storage] Не удалось создать canvas контекст");
            resolve(file);
          }
        };
        img.onerror = () => {
          console.warn(
            "[storage] Ошибка загрузки изображения, используем оригинал",
          );
          resolve(file);
        };
      };
      reader.onerror = () => {
        console.warn("[storage] Ошибка чтения файла, используем оригинал");
        resolve(file);
      };
    });
  },

  /**
   * Загрузка файла в Supabase Storage с оптимизацией
   * @param file Файл для загрузки
   * @param bucketName Имя хранилища (создается, если не существует)
   * @returns Публичный URL загруженного файла или null при ошибке
   */
  async uploadFile(
    file: File,
    bucketName: string,
    folderPath?: string,
  ): Promise<string | null> {
    try {
      // Проверяем тип файла
      if (file.type.startsWith("image/") && file.size > 500 * 1024) {
        file = await this.compressImage(file);
      }

      // Генерируем уникальное имя файла
      const fileExt = file.name.split(".").pop() || "";
      const fileName = `${Date.now()}-${uuidv4()}.${fileExt}`;

      // Нормализуем имя бакета (убираем слеши, пробелы)
      const safeBucket = bucketName.replace(/[^a-zA-Z0-9_-]/g, "-");

      // Загружаем напрямую на наш MongoDB-сервер
      const formData = new FormData();
      formData.append("file", file, fileName);
      if (folderPath) formData.append("folder", folderPath);

      const token = getToken();
      const uploadRes = await fetch(
        `${API_BASE}/api/storage/${safeBucket}/upload?path=${encodeURIComponent(fileName)}`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        },
      );

      const uploadJson = await uploadRes.json();
      if (uploadJson.error || !uploadJson.data?.path) {
        throw new Error(
          uploadJson.error?.message || "Сервер не вернул путь файла",
        );
      }

      const publicUrl = `${API_BASE}/uploads/${safeBucket}/${uploadJson.data.path}`;
      return publicUrl;
    } catch (error: any) {
      console.error("[storage] Загрузка окончательно не удалась:", error);
      return null;
    }
  },

  /**
   * Удаление файла из Supabase Storage
   * @param fileUrl Публичный URL файла для удаления
   * @param bucketName Имя хранилища
   * @returns true если удаление успешно, false в противном случае
   */
  async deleteFile(fileUrl: string, bucketName: string): Promise<boolean> {
    try {
      // Извлекаем путь файла из URL
      const urlPath = new URL(fileUrl).pathname;
      const filePath = urlPath.split("/").slice(2).join("/");
      // Удаляем через наш MongoDB-сервер
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/storage/${bucketName}/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ paths: [filePath] }),
      });
      const json = await res.json();
      if (json.error) {
        console.error("[storage] Ошибка удаления:", json.error);
        return false;
      }
      return true;
    } catch (error: any) {
      console.error("[storage] Ошибка удаления:", error);
      return false;
    }
  },

  /**
   * Получение информации о файле по URL
   * @param fileUrl Публичный URL файла
   * @returns Информация о файле или null при ошибке
   */
  async getFileInfo(
    fileUrl: string,
  ): Promise<{ size: number; contentType: string } | null> {
    try {
      // Выполняем HEAD-запрос для получения метаданных
      const response = await fetch(fileUrl, {
        method: "HEAD",
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      return {
        size: parseInt(response.headers.get("content-length") || "0", 10),
        contentType: response.headers.get("content-type") || "",
      };
    } catch (error) {
      console.error("[storage] Ошибка получения информации о файле:", error);
      return null;
    }
  },
};
