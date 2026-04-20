export interface Review {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_email?: string | null;
  rating: number;
  image_url?: string | null;
  project_id?: string | null;
  is_published?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  approved_by?: string | null;
  projects?: {
    title: string;
  };
  status?: 'draft' | 'pending' | 'published' | 'rejected';
}

export interface ReviewImageData {
  id?: string;
  review_id: string;
  image_url: string;
  description?: string | null;
  display_order?: number | null;
  created_at?: string | null;
}

export interface ReviewImage {
  id: string;
  review_id: string;
  image_url: string;
  description: string | null;
  display_order: number;
  created_at: string | null;
  project_id?: string; // Добавляем опциональное поле для совместимости с ProjectImage
}
