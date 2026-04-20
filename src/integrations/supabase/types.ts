export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_images: {
        Row: {
          blog_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string
        }
        Insert: {
          blog_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
        }
        Update: {
          blog_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_images_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          category_id: string | null
          content: string | null
          cover_image: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_email: string | null
          author_name: string
          blog_id: string | null
          content: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_email?: string | null
          author_name: string
          blog_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_email?: string | null
          author_name?: string
          blog_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      finances: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          transaction_date: string | null
          type: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          transaction_date?: string | null
          type: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          transaction_date?: string | null
          type?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          city: string | null
          construction_year: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          title: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          construction_year?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          title: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          construction_year?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hero_carousel: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          link_url: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          link_url?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          link_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          category_id: string | null
          content: string | null
          cover_image: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          slug: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      project_images: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_type: string | null
          image_url: string
          project_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url: string
          project_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url?: string
          project_id?: string
        }
        Relationships: []
      }
      project_orders: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          project_id: string | null
          status: string
          updated_at: string | null
          user_email: string | null
          user_phone: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string | null
          user_email?: string | null
          user_phone?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string | null
          user_email?: string | null
          user_phone?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          areavalue: number | null
          bathrooms: number | null
          bedrooms: number | null
          category_id: string | null
          content: string | null
          cover_image: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          designer_first_name: string | null
          designer_last_name: string | null
          dimensions: string | null
          hasgarage: boolean | null
          hasterrace: boolean | null
          id: string
          is_published: boolean | null
          material: string | null
          pricevalue: number | null
          stories: number | null
          style: string | null
          tags: string[] | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          areavalue?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          category_id?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          designer_first_name?: string | null
          designer_last_name?: string | null
          dimensions?: string | null
          hasgarage?: boolean | null
          hasterrace?: boolean | null
          id?: string
          is_published?: boolean | null
          material?: string | null
          pricevalue?: number | null
          stories?: number | null
          style?: string | null
          tags?: string[] | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          areavalue?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          category_id?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          designer_first_name?: string | null
          designer_last_name?: string | null
          dimensions?: string | null
          hasgarage?: boolean | null
          hasterrace?: boolean | null
          id?: string
          is_published?: boolean | null
          material?: string | null
          pricevalue?: number | null
          stories?: number | null
          style?: string | null
          tags?: string[] | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      review_images: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          review_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          review_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_images_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          approved_by: string | null
          author_email: string | null
          author_name: string
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          project_id: string | null
          rating: number
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          author_email?: string | null
          author_name: string
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          project_id?: string | null
          rating: number
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          author_email?: string | null
          author_name?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          project_id?: string | null
          rating?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_designers"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visits: {
        Row: {
          id: string
          ip_address: string
          page_path: string
          user_agent: string | null
          user_id: string | null
          visit_date: string | null
        }
        Insert: {
          id?: string
          ip_address: string
          page_path: string
          user_agent?: string | null
          user_id?: string | null
          visit_date?: string | null
        }
        Update: {
          id?: string
          ip_address?: string
          page_path?: string
          user_agent?: string | null
          user_id?: string | null
          visit_date?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          cache_enabled: boolean | null
          created_at: string | null
          id: number
          max_concurrent_requests: number | null
          preload_assets: boolean | null
          updated_at: string | null
        }
        Insert: {
          cache_enabled?: boolean | null
          created_at?: string | null
          id?: number
          max_concurrent_requests?: number | null
          preload_assets?: boolean | null
          updated_at?: string | null
        }
        Update: {
          cache_enabled?: boolean | null
          created_at?: string | null
          id?: number
          max_concurrent_requests?: number | null
          preload_assets?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_date: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          client_stage: string | null
          current_stage: string | null
          folders: Json | null
          id: string
          project_stats: Json | null
          role: string | null
          schedule: Json | null
          username: string | null
          work_stages: string[] | null
          work_tasks: Json | null
        }
        Insert: {
          client_stage?: string | null
          current_stage?: string | null
          folders?: Json | null
          id: string
          project_stats?: Json | null
          role?: string | null
          schedule?: Json | null
          username?: string | null
          work_stages?: string[] | null
          work_tasks?: Json | null
        }
        Update: {
          client_stage?: string | null
          current_stage?: string | null
          folders?: Json | null
          id?: string
          project_stats?: Json | null
          role?: string | null
          schedule?: Json | null
          username?: string | null
          work_stages?: string[] | null
          work_tasks?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      projects_with_designers: {
        Row: {
          areavalue: number | null
          bathrooms: number | null
          bedrooms: number | null
          category_id: string | null
          content: string | null
          cover_image: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          designer_first_name: string | null
          designer_full_name: string | null
          designer_last_name: string | null
          dimensions: string | null
          hasgarage: boolean | null
          hasterrace: boolean | null
          id: string | null
          is_published: boolean | null
          material: string | null
          pricevalue: number | null
          stories: number | null
          style: string | null
          tags: string[] | null
          title: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          areavalue?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          category_id?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          designer_first_name?: string | null
          designer_full_name?: never
          designer_last_name?: string | null
          dimensions?: string | null
          hasgarage?: boolean | null
          hasterrace?: boolean | null
          id?: string | null
          is_published?: boolean | null
          material?: string | null
          pricevalue?: number | null
          stories?: number | null
          style?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          areavalue?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          category_id?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          designer_first_name?: string | null
          designer_full_name?: never
          designer_last_name?: string | null
          dimensions?: string | null
          hasgarage?: boolean | null
          hasterrace?: boolean | null
          id?: string | null
          is_published?: boolean | null
          material?: string | null
          pricevalue?: number | null
          stories?: number | null
          style?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_project_image: {
        Args: {
          project_id: string
          image_url: string
          description?: string
          display_order?: number
        }
        Returns: string
      }
      admin_delete_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_storage_bucket_access: {
        Args: { bucket_name: string }
        Returns: boolean
      }
      create_bucket_if_not_exists: {
        Args: { bucket_id: string; bucket_public: boolean }
        Returns: undefined
      }
      create_project_images_bucket: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      create_storage_policy: {
        Args: {
          bucket_id: string
          policy_name: string
          policy_definition: string
          operation_type: string
        }
        Returns: undefined
      }
      delete_project_transaction: {
        Args: { project_id_param: string }
        Returns: boolean
      }
      ensure_bucket_exists: {
        Args: { bucket_id: string }
        Returns: boolean
      }
      exec_sql: {
        Args: { sql_query: string }
        Returns: undefined
      }
      execute_sql: {
        Args: { sql_query: string }
        Returns: undefined
      }
      setup_storage_policies: {
        Args: { bucket_name: string }
        Returns: boolean
      }
      update_project: {
        Args: { p_id: string; p_data: Json }
        Returns: boolean
      }
      upload_project_image: {
        Args: { project_id: string; image_url: string; description?: string }
        Returns: string
      }
      verify_project_images_bucket: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "foreman" | "manager" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "foreman", "manager", "client"],
    },
  },
} as const
