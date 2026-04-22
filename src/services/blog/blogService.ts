import { db } from "@/integrations/db/client";
import { BlogPost } from "./types";
import blogQueryService from "./blogQueryService";
import blogMutationService from "./blogMutationService";
import blogImageService from "./imageService";

/**
 * Унифицированный сервис для работы с блогом
 */
const blogService = {
  // Операции запросов
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
  },
  
  // Операции мутации
  createBlogPost: blogMutationService.createBlogPost,
  updateBlogPost: blogMutationService.updateBlogPost,
  deleteBlogPost: blogMutationService.deleteBlogPost,
  updateBlogStatus: blogMutationService.updateBlogStatus,
  
  // Операции с изображениями
  getBlogImages: blogImageService.getBlogImages,
  addBlogImage: blogImageService.addBlogImage,
  updateBlogImage: blogImageService.updateBlogImage,
  deleteBlogImage: blogImageService.deleteBlogImage,
  updateImagesOrder: blogImageService.updateImagesOrder
};

export default blogService;
