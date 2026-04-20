
import { db } from "@/integrations/db/client";
import { toast } from "@/components/ui/use-toast";

export interface Category {
  id?: string;
  name: string;
  description?: string;
  type: 'project' | 'blog' | 'news';
  created_at?: string;
  updated_at?: string;
}

class CategoryService {
  public async getCategories(type?: 'project' | 'blog' | 'news'): Promise<Category[]> {
    try {
      let query = db
        .from('categories')
        .select('*');
      
      if (type) {
        query = query.eq('type', type);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) {
        console.error("Error fetching categories:", error.message);
        return [];
      }
      
      // Приведение типов данных из БД к типу Category
      return (data || []).map(item => ({
        ...item,
        type: item.type as 'project' | 'blog' | 'news'
      }));
    } catch (error) {
      console.error("Error in getCategories:", error);
      return [];
    }
  }
  
  public async getCategoryById(id: string): Promise<Category | null> {
    try {
      const { data, error } = await db
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching category:", error.message);
        return null;
      }
      
      if (!data) return null;
      
      // Приведение типа
      return {
        ...data,
        type: data.type as 'project' | 'blog' | 'news'
      };
    } catch (error) {
      console.error("Error in getCategoryById:", error);
      return null;
    }
  }
  
  public async createCategory(category: Category): Promise<Category | null> {
    try {
      const { data, error } = await db
        .from('categories')
        .insert([category])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating category:", error.message);
        toast({
          title: "Ошибка создания категории",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "Категория создана",
        description: `Категория "${category.name}" успешно создана`,
      });
      
      // Приведение типа
      return {
        ...data,
        type: data.type as 'project' | 'blog' | 'news'
      };
    } catch (error) {
      console.error("Error in createCategory:", error);
      return null;
    }
  }
  
  public async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category | null> {
    try {
      const { data, error } = await db
        .from('categories')
        .update({
          ...categoryData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating category:", error.message);
        toast({
          title: "Ошибка обновления категории",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "Категория обновлена",
        description: `Категория успешно обновлена`,
      });
      
      // Приведение типа
      return {
        ...data,
        type: data.type as 'project' | 'blog' | 'news'
      };
    } catch (error) {
      console.error("Error in updateCategory:", error);
      return null;
    }
  }
  
  public async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await db
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting category:", error.message);
        toast({
          title: "Ошибка удаления категории",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Категория удалена",
        description: "Категория была успешно удалена",
      });
      
      return true;
    } catch (error) {
      console.error("Error in deleteCategory:", error);
      return false;
    }
  }
}

export default new CategoryService();
