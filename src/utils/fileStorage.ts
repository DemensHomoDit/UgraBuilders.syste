import { v4 as uuidv4 } from "uuid";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

function getToken(): string {
  try {
    return localStorage.getItem("mongo_auth_token") ?? "";
  } catch {
    return "";
  }
}

/**
 * Утилиты для работы с файловым хранилищем (Express + PostgreSQL)
 */
export const fileStorage = {
  /**
   * Предварительная обработка изображения перед загрузкой
   */
  async compressImage(
    file: File,
    maxWidth = 1920,
    maxHeight = 1080,
  ): Promise<File> {
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
          if (
            img.width <= maxWidth &&
            img.height <= maxHeight &&
            file.size < 5 * 1024 * 1024
          ) {
            resolve(file);
            return;
          }

          let width = img.width;
          let height = img.height;

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

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);

            const outputType = file.type;
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const resizedFile = new File([blob], file.name, {
                    type: outputType,
                    lastModified: Date.now(),
                  });
                  resolve(resizedFile);
                } else {
                  resolve(file);
                }
              },
              outputType,
              0.95,
            );
          } else {
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  },

  /**
   * Загрузка файла в хранилище
   * @param file Файл для загрузки
   * @param bucketName Имя бакета (папки)
   * @param folderPath Подпапка (опционально)
   * @returns Публичный URL загруженного файла или null при ошибке
   */
  async uploadFile(
    file: File,
    bucketName: string,
    folderPath?: string,
  ): Promise<string | null> {
    try {
      if (file.type.startsWith("image/") && file.size > 500 * 1024) {
        file = await this.compressImage(file);
      }

      const fileExt = file.name.split(".").pop() || "";
      const fileName = `${Date.now()}-${uuidv4()}.${fileExt}`;
      const safeBucket = bucketName.replace(/[^a-zA-Z0-9_-]/g, "-");

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

      return `${API_BASE}/uploads/${safeBucket}/${uploadJson.data.path}`;
    } catch (error: any) {
      console.error("[storage] Загрузка не удалась:", error);
      return null;
    }
  },

  /**
   * Удаление файла из хранилища
   * @param fileUrl Публичный URL файла
   * @param bucketName Имя бакета
   */
  async deleteFile(fileUrl: string, bucketName: string): Promise<boolean> {
    try {
      const urlPath = new URL(fileUrl).pathname;
      const filePath = urlPath.split("/").slice(2).join("/");
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
   * Получение метаданных файла по URL
   */
  async getFileInfo(
    fileUrl: string,
  ): Promise<{ size: number; contentType: string } | null> {
    try {
      const response = await fetch(fileUrl, { method: "HEAD", cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return {
        size: parseInt(response.headers.get("content-length") || "0", 10),
        contentType: response.headers.get("content-type") || "",
      };
    } catch (error) {
      console.error("[storage] Ошибка получения метаданных:", error);
      return null;
    }
  },
};

// Backward-compatible alias
export const supabaseStorage = fileStorage;
