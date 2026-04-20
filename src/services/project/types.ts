// Обновляем интерфейс Project, чтобы исключить поля, которых нет в базе данных

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  description?: string | null;
  display_order: number;
  created_at: string;
  image_type: "main" | "general" | "floor_plan"; // Строгая типизация для image_type
}

export interface Category {
  id: string; // id должен быть обязательным полем
  name: string;
  description?: string;
  type: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id?: string;
  title: string;
  description?: string;
  content?: string;
  cover_image?: string;
  category_id?: string;
  tags?: string[];
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  // Поля из базы данных
  areavalue?: number;  
  bedrooms?: number;
  bathrooms?: number;
  pricevalue?: number;  
  dimensions?: string;
  material?: string;
  stories?: number;
  hasgarage?: boolean;
  hasterrace?: boolean;
  type?: string;
  style?: string;
  designer_first_name?: string; // Добавляем поля для проектировщика
  designer_last_name?: string;  // Добавляем поля для проектировщика
  categories?: Category; // Для связи с категориями
  status?: "draft" | "pending" | "published" | "rejected";
}

export interface ProjectOrder {
  id: string;
  project_id?: string;
  user_email?: string;
  user_phone?: string;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
