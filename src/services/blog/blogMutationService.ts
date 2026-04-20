import { db } from "@/integrations/db/client";
import { BlogPost } from "./types";
import blogImageService from "./imageService";
import { toast } from "sonner";
import { withRetry } from "@/utils/retry";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Сервис для создания, обновления и удаления постов блога
 */
const blogMutationService = {
  /**
   * Создать новый пост блога
   */
  createBlogPost: async (data: Partial<BlogPost>): Promise<BlogPost | null> => {
    return withRetry(async () => {
      try {
        // Проверка наличия обязательных полей
        if (!data.title) {
          throw new Error("Требуется заголовок поста");
        }
        
        // Создаем проверенный объект с необходимыми полями
        const validatedData = {
          title: data.title,
          summary: data.summary,
          content: data.content,
          cover_image: data.cover_image,
          category_id: data.category_id,
          is_published: data.is_published,
          tags: data.tags
        };

        const { data: newPost, error } = await db
          .from('blog_posts')
          .insert(validatedData)
          .select()
          .single();

        if (error) throw error;
        toast.success("Пост блога успешно создан");
        return newPost;
      } catch (error) {
        console.error("Ошибка при создании поста блога:", error);
        throw error;
      }
    }, {
      onError: (error) => {
        toast.error(`Ошибка при работе с блогом: ${error?.message || "Неизвестная ошибка"}`);
      }
    }).catch(() => null);
  },

  /**
   * Обновить существующий пост блога
   */
  updateBlogPost: async (id: string, data: Partial<BlogPost>): Promise<BlogPost | null> => {
    return withRetry(async () => {
      try {
        const { data: updatedPost, error } = await db
          .from('blog_posts')
          .update({ 
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        toast.success("Пост блога успешно обновлён");
        return updatedPost;
      } catch (error) {
        console.error('Ошибка при обновлении поста блога:', error);
        throw error;
      }
    }, {
      onError: (error) => {
        toast.error(`Ошибка при работе с блогом: ${error?.message || "Неизвестная ошибка"}`);
      }
    }).catch(() => null);
  },

  /**
   * Удалить пост блога и связанные изображения
   */
  deleteBlogPost: async (id: string): Promise<boolean> => {
    return withRetry(async () => {
      try {
        // Удаляем все связанные изображения
        try {
          await blogImageService.deleteAllBlogImages(id);
        } catch (imageError) {
          console.error(`Ошибка при удалении изображений для поста ${id}:`, imageError);
          // Продолжаем, даже если не удалось удалить изображения
        }
        
        // Удаляем сам пост
        const { error } = await db
          .from('blog_posts')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error(`Ошибка при удалении поста ${id}:`, error);
          throw error;
        }
        toast.success("Пост блога успешно удалён");
        return true;
      } catch (error) {
        console.error('Ошибка при удалении поста блога:', error);
        throw error;
      }
    }, {
      onError: (error) => {
        toast.error(`Ошибка при работе с блогом: ${error?.message || "Неизвестная ошибка"}`);
      }
    }).catch(() => false);
  },

  /**
   * Обновить статус workflow поста блога (draft, pending, published, rejected)
   */
  updateBlogStatus: async (id: string, status: 'draft' | 'pending' | 'published' | 'rejected'): Promise<BlogPost | null> => {
    return withRetry(async () => {
      const { data, error } = await db
        .from('blog_posts')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        toast.error(`Ошибка при обновлении статуса поста: ${error.message}`);
        throw error;
      }
      toast.success(`Статус поста обновлён: ${status}`);
      return data;
    }, {
      onError: (error) => {
        toast.error(`Ошибка при обновлении статуса поста: ${error?.message || 'Неизвестная ошибка'}`);
      }
    }).catch(() => null);
  }
};

export default blogMutationService;
