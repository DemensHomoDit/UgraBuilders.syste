
import { useState, useEffect } from "react";
import { db } from "@/integrations/db/client";
import { Category } from "@/services/project/types";
import { toast } from "sonner";

export const useProjectCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await db
        .from("categories")
        .select("*")
        .order("name");
        
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error: any) {
      console.error("Ошибка при загрузке категорий:", error);
      toast.error("Не удалось загрузить категории проектов");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories,
    isLoading,
    reloadCategories: loadCategories
  };
};
