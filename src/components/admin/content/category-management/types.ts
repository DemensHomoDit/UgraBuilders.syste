
import { Category } from "@/services/categoryService";

export interface CategoryFormData extends Omit<Category, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export type CategoryType = 'project' | 'blog' | 'news' | 'commercial';
