
import { useState, useEffect } from "react";
import { db } from "@/integrations/db/client";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
}

interface UseCategorySelectOptions {
  type?: string;
  onError?: (error: Error) => void;
}

export function useCategorySelect(options: UseCategorySelectOptions = {}) {
  const { type = "blog", onError } = options;
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await db
          .from('categories')
          .select('id, name')
          .eq('type', type)
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error(`Error loading ${type} categories:`, error);
        
        toast({
          title: `Ошибка загрузки категорий`,
          description: `Не удалось загрузить категории типа ${type}`,
          variant: "destructive",
        });
        
        if (onError && error instanceof Error) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [type, toast, onError]);

  return { categories, isLoading };
}
