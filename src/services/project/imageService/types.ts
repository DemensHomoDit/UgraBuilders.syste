
export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  description?: string | null;
  display_order: number;
  created_at: string;
  image_type: "main" | "general" | "floor_plan"; // Строгая типизация для image_type
}

export interface ImageOrder {
  id: string;
  display_order: number;
}
