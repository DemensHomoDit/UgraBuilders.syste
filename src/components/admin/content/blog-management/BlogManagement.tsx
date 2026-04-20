
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import BlogList from "./BlogList";
import BlogFormDialog from "./BlogFormDialog";
import { BlogPost } from "@/services/blog/types";
import blogService from "@/services/blog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/integrations/db/client";

const BlogManagement: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Инициализация компонента
    const init = async () => {
      try {
        // Загружаем записи блога и категории
        await loadBlogPosts();
        await loadCategories();
      } catch (error) {
        console.error("Error during initialization:", error);
        toast({
          title: "Ошибка инициализации",
          description: "Не удалось выполнить настройку приложения",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  const loadBlogPosts = async () => {
    setIsLoading(true);
    try {
      const posts = await blogService.getBlogPosts();
      setBlogPosts(posts);
    } catch (error) {
      console.error("Error loading blog posts:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить записи блога",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    }
  };

  const handleNewClick = () => {
    setSelectedBlogPost(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (blogPost: BlogPost) => {
    setSelectedBlogPost(blogPost);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedBlogPost(null);
    setIsDialogOpen(false);
    loadBlogPosts(); // Refresh the list after closing dialog
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Управление блогом</h2>
        <p className="text-muted-foreground">
          Создавайте и управляйте записями блога на вашем сайте
        </p>
      </div>
      <Separator />

      <BlogList
        blogs={blogPosts}
        onNewClick={handleNewClick}
        onEditClick={handleEditClick}
        onBlogsChange={loadBlogPosts}
        categories={categories}
      />

      <BlogFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedBlogPost={selectedBlogPost}
        onClose={handleDialogClose}
        userId={user?.id || ''}
      />
    </div>
  );
};

export default BlogManagement;
