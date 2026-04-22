
import { db } from "@/integrations/db/client";
import { ReviewImage } from "./types";

// Константа для пути к хранилищу
const STORAGE_BUCKET = "project-images";
const STORAGE_PATH = "review-images";

// Расширение типа для совместимости с существующим кодом
interface ProjectCompatibleImage extends Omit<ReviewImage, 'review_id'> {
  project_id: string;
  review_id: string; // Добавляем поле review_id для совместимости
}

/**
 * Service for review images operations
 */
const reviewImageService = {
  /**
   * Get all images for a review
   */
  getReviewImages: async (reviewId: string): Promise<ReviewImage[]> => {
    try {
      const { data, error } = await db
        .from('review_images')
        .select('*')
        .eq('review_id', reviewId)
        .order('display_order', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Трансформируем данные для совместимости с ReviewImage
      return (data || []).map(img => ({
        ...img,
        project_id: img.review_id, // Маппим для совместимости с ProjectImage
        review_id: img.review_id // Явно указываем поле review_id
      }));
    } catch (error) {
      console.error("Error fetching review images:", error);
      return [];
    }
  },
  
  /**
   * Add a new image to a review
   */
  addReviewImage: async (reviewId: string, imageData: { image_url: string; description?: string | null }): Promise<ProjectCompatibleImage> => {
    try {
      // Get current highest display order
      const { data: existingImages } = await db
        .from('review_images')
        .select('display_order')
        .eq('review_id', reviewId)
        .order('display_order', { ascending: false })
        .limit(1);
      
      const nextOrder = existingImages && existingImages.length > 0 
        ? (existingImages[0].display_order + 1) 
        : 0;
      
      const newImage = {
        review_id: reviewId,
        image_url: imageData.image_url,
        description: imageData.description || '',
        display_order: nextOrder
      };
      
      const { data, error } = await db
        .from('review_images')
        .insert(newImage)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Трансформируем для совместимости
      return {
        ...data,
        project_id: data.review_id
      };
    } catch (error) {
      console.error('Error adding review image:', error);
      throw error;
    }
  },
  
  /**
   * Update a review image
   */
  updateReviewImage: async (imageId: string, imageData: Partial<ProjectCompatibleImage>): Promise<ProjectCompatibleImage | null> => {
    try {
      // Преобразуем данные обратно для использования в БД
      const dbImageData: any = { ...imageData };
      if ('project_id' in dbImageData) {
        delete dbImageData.project_id;
      }
      
      const { data, error } = await db
        .from('review_images')
        .update(dbImageData)
        .eq('id', imageId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Трансформируем для совместимости
      return data ? {
        ...data,
        project_id: data.review_id
      } : null;
    } catch (error) {
      console.error('Error updating review image:', error);
      return null;
    }
  },
  
  /**
   * Delete a review image
   */
  deleteReviewImage: async (imageId: string): Promise<boolean> => {
    try {
      const { error } = await db
        .from('review_images')
        .delete()
        .eq('id', imageId);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting review image:', error);
      return false;
    }
  },
  
  /**
   * Update the order of review images
   */
  updateImagesOrder: async (images: Array<{ id: string, display_order: number }>): Promise<boolean> => {
    try {
      for (const image of images) {
        const { error } = await db
          .from('review_images')
          .update({ display_order: image.display_order })
          .eq('id', image.id);
        
        if (error) {
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating review images order:', error);
      return false;
    }
  },
  
  /**
   * Delete all images for a review
   */
  deleteAllReviewImages: async (reviewId: string): Promise<boolean> => {
    try {
      // Получаем все изображения для удаления из хранилища
      const { data: images, error: fetchError } = await db
        .from('review_images')
        .select('id, image_url')
        .eq('review_id', reviewId);
      
      if (fetchError) {
        console.error(`Error fetching review images for deletion:`, fetchError);
        // Продолжим даже при ошибке, чтобы попытаться удалить записи
      }
      
      // Удаляем сами записи в базе данных
      const { error: deleteError } = await db
        .from('review_images')
        .delete()
        .eq('review_id', reviewId);
      
      if (deleteError) {
        console.error(`Error deleting review images from database:`, deleteError);
        // Продолжим для очистки хранилища
      }
      
      // Удаляем файлы из хранилища, если они там есть
      try {
        for (const image of images || []) {
          if (image.image_url && image.image_url.includes('storage')) {
            const path = image.image_url.split('/').slice(-2).join('/');
            if (path) {
              await db.storage
                .from(STORAGE_BUCKET)
                .remove([path]);
            }
          }
        }
      } catch (storageError) {
        console.error('Error deleting image files from storage:', storageError);
      }
      
      return true;
    } catch (error) {
      console.error(`Error in deleteAllReviewImages:`, error);
      // Возвращаем true для продолжения цепочки операций
      return true;
    }
  }
};

export default reviewImageService;
