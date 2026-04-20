export interface BlogPost {
  id: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  cover_image?: string | null;
  category_id?: string | null;
  is_published?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  tags?: string[] | null;
  categories?: {
    name: string;
  };
  status?: 'draft' | 'pending' | 'published' | 'rejected';
}

export interface BlogImageData {
  id?: string;
  blog_id: string;
  image_url: string;
  description?: string | null;
  display_order?: number | null;
  created_at?: string | null;
}

export interface BlogImage {
  id: string;
  blog_id: string;
  image_url: string;
  description: string | null;
  display_order: number;
  created_at: string | null;
}
