
import { db } from "@/integrations/db/client";
import { BlogPost } from "./types";

/**
 * Сервис для получения постов блога
 */
const blogQueryService = {
  /**
   * Получить все посты блога
   */
  getBlogPosts: async (): Promise<BlogPost[]> => {
    try {
      const { data, error } = await db
        .from('blog_posts')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Ошибка при загрузке постов блога:", error);
      return [];
    }
  },

  /**
   * Получить пост блога по ID
   */
  getBlogPost: async (id: string): Promise<BlogPost | null> => {
    try {
      const { data, error } = await db
        .from('blog_posts')
        .select('*, categories(name)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Ошибка при загрузке поста блога:", error);
      return null;
    }
  }
};

export default blogQueryService;
