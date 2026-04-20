
/**
 * Интерфейс для проекта дома
 */
export interface Project {
  id: string;
  title: string;
  description?: string;
  type?: string;
  areavalue?: number;
  pricevalue?: number;
  dimensions?: string;
  bedrooms?: number;
  bathrooms?: number;
  cover_image?: string;
  style?: string;
  stories?: number;
  hasgarage?: boolean;
  hasterrace?: boolean;
  content?: string;
  category_id?: string;
  tags?: string[];
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  material?: string;
  designer_first_name?: string;
  designer_last_name?: string;
  foundation_type?: string;
  roof_type?: string;
  heating?: string;
  insulation?: string;
  window_type?: string;
  ceiling_height?: number;
  rooms?: number;
  hasbasement?: boolean;
  hassecondlight?: boolean;
  haspantry?: boolean;
  hasbalcony?: boolean;
  hasfireplace?: boolean;
  construction_time?: string;
  floor_count?: number;
  wall_thickness?: string;
  status?: string;
  rejection_reason?: string;
}

/**
 * Интерфейс для UI-представления проекта
 */
export interface ProjectUI {
  id: string;
  title: string;
  type: string;
  price: string;
  area: string;
  dimensions?: string;
  bedrooms: number;
  bathrooms: number;
  description: string;
  image: string;
  style: string;
  stories: number;
  hasGarage: boolean;
  hasTerrace: boolean;
  priceValue: number;
  areaValue: number;
  designerFirstName?: string;
  designerLastName?: string;
}
