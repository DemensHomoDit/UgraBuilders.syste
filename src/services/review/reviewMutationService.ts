import { db } from "@/integrations/db/client";
import { Review } from "./types";
import reviewImageService from "./imageService";
import { toast } from "sonner";
import { withRetry } from "@/utils/retry";

/**
 * Service for creating, updating, and deleting reviews
 */
const reviewMutationService = {
  /**
   * Create a new review
   */
  createReview: async (data: Partial<Review>): Promise<Review> => {
    try {
      // Make sure required fields are present in the data
      if (!data.title) {
        throw new Error("Review title is required");
      }
      if (!data.author_name) {
        throw new Error("Author name is required");
      }
      if (!data.content) {
        throw new Error("Review content is required");
      }
      if (data.rating === undefined || data.rating === null) {
        throw new Error("Rating is required");
      }
      
      // Create a validated object with required fields
      const validatedData = {
        title: data.title,
        author_name: data.author_name,
        content: data.content,
        rating: data.rating,
        // Include other optional fields
        author_email: data.author_email,
        image_url: data.image_url,
        project_id: data.project_id,
        is_published: data.is_published !== undefined ? data.is_published : false,
        created_by: data.created_by,
        approved_by: data.approved_by
      };

      const { data: newReview, error } = await db
        .from('reviews')
        .insert(validatedData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return newReview;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update an existing review
   */
  updateReview: async (id: string, data: Partial<Review>): Promise<Review> => {
    try {
      const { data: updatedReview, error } = await db
        .from('reviews')
        .update({ 
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return updatedReview;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a review and its associated images
   */
  deleteReview: async (id: string): Promise<boolean> => {
    try {
      // Сначала пробуем удалить связанные изображения
      try {
        await reviewImageService.deleteAllReviewImages(id);
      } catch (imageError) {
        // Продолжаем даже при ошибке удаления изображений
      }
      
      // Теперь удаляем сам отзыв
      const { error } = await db
        .from('reviews')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Обновить статус workflow отзыва (draft, pending, published, rejected)
   */
  updateReviewStatus: async (id: string, status: 'draft' | 'pending' | 'published' | 'rejected'): Promise<Review> => {
    return withRetry(async () => {
      const { data, error } = await db
        .from('reviews')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        toast.error(`Ошибка при обновлении статуса отзыва: ${error.message}`);
        throw error;
      }
      toast.success(`Статус отзыва обновлён: ${status}`);
      return data;
    }, {
      onError: (error) => {
        toast.error(`Ошибка при обновлении статуса отзыва: ${error?.message || 'Неизвестная ошибка'}`);
      }
    });
  }
};

export default reviewMutationService;
