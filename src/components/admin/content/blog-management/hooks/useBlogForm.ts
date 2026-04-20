
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlogPost } from "@/services/blog/types";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/integrations/db/client";
import blogService from "@/services/blog";

// Form validation schema
export const blogFormSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  summary: z.string().optional(),
  content: z.string().optional(),
  category_id: z.string().optional(),
  is_published: z.boolean().default(false),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;

interface UseBlogFormProps {
  blogPost?: BlogPost;
  onSave: (blogPost: BlogPost) => void;
  onCancel: () => void;
  userId: string;
}

export const useBlogForm = ({ blogPost, onSave, onCancel, userId }: UseBlogFormProps) => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(blogPost?.cover_image || "");
  const { toast } = useToast();

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: blogPost?.title || "",
      summary: blogPost?.summary || "",
      content: blogPost?.content || "",
      category_id: blogPost?.category_id || undefined,
      is_published: blogPost?.is_published || false,
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await db
          .from('categories')
          .select('id, name')
          .eq('type', 'blog')
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast({
          title: "Ошибка загрузки категорий",
          description: "Не удалось загрузить категории блога",
          variant: "destructive",
        });
      }
    };

    loadCategories();
  }, [toast]);

  const handleFormSubmit = async (values: BlogFormValues) => {
    setIsLoading(true);
    try {
      const blogData = {
        ...values,
        cover_image: coverImage,
      };

      let savedBlogPost: BlogPost;

      if (blogPost?.id) {
        // Обновление существующей записи
        savedBlogPost = await blogService.updateBlogPost(blogPost.id, blogData);
        toast({
          title: "Запись блога обновлена",
          description: "Запись блога успешно обновлена",
        });
      } else {
        // Создание новой записи
        savedBlogPost = await blogService.createBlogPost({
          ...blogData,
          created_by: userId,
        });
        toast({
          title: "Запись блога создана",
          description: "Новая запись блога успешно создана",
        });
      }

      onSave(savedBlogPost);
    } catch (error) {
      console.error("Error saving blog post:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить запись блога",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverImageUpload = (url: string) => {
    setCoverImage(url);
  };

  return {
    form,
    isLoading,
    categories,
    coverImage,
    handleFormSubmit,
    handleCoverImageUpload,
    onCancel
  };
};
