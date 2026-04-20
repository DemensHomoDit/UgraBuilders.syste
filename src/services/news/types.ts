export interface NewsItem {
  id: string;
  title: string;
  content?: string;
  cover_image?: string;
  summary?: string;
  slug?: string;
  tags?: string[];
  is_published?: boolean;
  category_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
