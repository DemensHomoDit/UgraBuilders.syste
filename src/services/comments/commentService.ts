import { db } from "@/integrations/db/client";
import { Comment, CommentData } from "./types";
import { toast } from "sonner";
import { withRetry } from "@/utils/retry";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Сервис для работы с комментариями
 */
const commentService = {
  /**
   * Получить все комментарии для записи блога
   */
  getComments: async (blogId: string): Promise<Comment[]> => {
    try {
      const { data, error } = await db
        .from('comments')
        .select('*')
        .eq('blog_id', blogId)
        .eq('is_approved', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }

      return (data || []) as Comment[];
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  },

  /**
   * Получить все комментарии (для администрирования)
   */
  getAllComments: async (): Promise<Comment[]> => {
    try {
      const { data, error } = await db
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching all comments:", error);
        throw error;
      }

      return (data || []) as Comment[];
    } catch (error) {
      console.error("Error fetching all comments:", error);
      return [];
    }
  },

  /**
   * Добавить новый комментарий
   */
  addComment: async (commentData: CommentData): Promise<Comment | null> => {
    return withRetry(async () => {
      const { data, error } = await db
        .from('comments')
        .insert({
          content: commentData.content,
          author_name: commentData.author_name,
          author_email: commentData.author_email,
          blog_id: commentData.blog_id,
          parent_id: commentData.parent_id || null,
          is_approved: false
        })
        .select();
      if (error) throw error;
      toast.success("Комментарий успешно добавлен (на модерации)");
      return data && data.length > 0 ? data[0] as Comment : null;
    }, {
      onError: (error) => {
        toast.error(`Ошибка при работе с комментариями: ${error?.message || "Неизвестная ошибка"}`);
      }
    }).catch(() => null);
  },

  /**
   * Обновить комментарий (доступно только для администраторов и редакторов)
   */
  updateComment: async (id: string, commentData: Partial<Comment>): Promise<Comment | null> => {
    return withRetry(async () => {
      const { data, error } = await db
        .from('comments')
        .update({
          ...commentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      if (error) throw error;
      toast.success("Комментарий успешно обновлён");
      return data && data.length > 0 ? data[0] as Comment : null;
    }, {
      onError: (error) => {
        toast.error(`Ошибка при работе с комментариями: ${error?.message || "Неизвестная ошибка"}`);
      }
    }).catch(() => null);
  },

  /**
   * Удалить комментарий
   */
  deleteComment: async (id: string): Promise<boolean> => {
    return withRetry(async () => {
      const { error } = await db
        .from('comments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success("Комментарий успешно удалён");
      return true;
    }, {
      onError: (error) => {
        toast.error(`Ошибка при работе с комментариями: ${error?.message || "Неизвестная ошибка"}`);
      }
    }).catch(() => false);
  },

  /**
   * Одобрить комментарий
   */
  approveComment: async (id: string): Promise<Comment | null> => {
    return commentService.updateComment(id, { is_approved: true });
  },

  /**
   * Отклонить комментарий
   */
  rejectComment: async (id: string): Promise<Comment | null> => {
    return commentService.updateComment(id, { is_approved: false });
  }
};

export default commentService;
