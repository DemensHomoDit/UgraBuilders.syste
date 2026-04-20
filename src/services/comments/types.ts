
export interface Comment {
  id: string;
  content: string;
  author_name: string;
  author_email?: string | null;
  blog_id: string;
  parent_id?: string | null;
  is_approved: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CommentData {
  content: string;
  author_name: string;
  author_email?: string;
  blog_id: string;
  parent_id?: string;
}
