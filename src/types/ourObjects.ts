// src/types/ourObjects.ts

export interface OurObject {
  id: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  description?: string;
  city?: string;
  construction_year?: number;
  area?: number;
  material?: string;
  stories?: number;
  cover_image?: string;
  slug?: string;
  display_order: number;
  is_published: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface OurObjectImage {
  id: string;
  object_id: string;
  image_url: string;
  caption?: string;
  display_order: number;
  created_at: string;
}

export interface OurObjectReview {
  id: string;
  object_id: string;
  author_name: string;
  author_title?: string;
  author_image?: string;
  rating?: number;
  title?: string;
  content?: string;
  is_published: boolean;
  created_at: string;
}
