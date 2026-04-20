
import { useState, useEffect } from "react";

// Префикс для ключей в localStorage
const CACHE_KEY_PREFIX = "image_cache_";

/**
 * Хук для кэширования URL изображений
 */
export const useImageCache = () => {
  const [cache, setCache] = useState<Record<string, string>>({});

  // Инициализация кэша при монтировании
  useEffect(() => {
    try {
      // Загружаем все кэшированные изображения из sessionStorage
      const cachedImages: Record<string, string> = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          const value = sessionStorage.getItem(key);
          if (value) {
            const cacheKey = key.replace(CACHE_KEY_PREFIX, "");
            cachedImages[cacheKey] = value;
          }
        }
      }
      setCache(cachedImages);
    } catch (error) {
      console.error("Ошибка при инициализации кэша изображений:", error);
    }
  }, []);

  /**
   * Сохранение URL изображения в кэш
   */
  const cacheImage = (key: string, url: string) => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${key}`;
      sessionStorage.setItem(cacheKey, url);
      setCache(prev => ({ ...prev, [key]: url }));
    } catch (error) {
      console.error("Ошибка при кэшировании изображения:", error);
    }
  };

  /**
   * Получение URL изображения из кэша
   */
  const getCachedImage = (key: string): string | null => {
    if (cache[key]) {
      return cache[key];
    }
    
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${key}`;
      const cachedUrl = sessionStorage.getItem(cacheKey);
      return cachedUrl;
    } catch (error) {
      console.error("Ошибка при получении кэшированного изображения:", error);
      return null;
    }
  };

  /**
   * Удаление URL изображения из кэша
   */
  const removeCachedImage = (key: string) => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${key}`;
      sessionStorage.removeItem(cacheKey);
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
    } catch (error) {
      console.error("Ошибка при удалении кэшированного изображения:", error);
    }
  };

  /**
   * Очистка всего кэша изображений
   */
  const clearImageCache = () => {
    try {
      // Удаляем только кэшированные изображения, не трогая другие данные
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      }
      setCache({});
    } catch (error) {
      console.error("Ошибка при очистке кэша изображений:", error);
    }
  };

  return {
    cacheImage,
    getCachedImage,
    removeCachedImage,
    clearImageCache,
    imageCache: cache
  };
};
