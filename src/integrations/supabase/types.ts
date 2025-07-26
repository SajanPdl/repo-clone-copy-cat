export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      advertisements: {
        Row: {
          ad_type: string | null
          content: string | null
          created_at: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          position: string | null
          title: string
        }
        Insert: {
          ad_type?: string | null
          content?: string | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          position?: string | null
          title: string
        }
        Update: {
          ad_type?: string | null
          content?: string | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          position?: string | null
          title?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: number
          is_published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: number
          is_published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: number
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          description: string | null
          document_type: string
          downloads_count: number | null
          file_path: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          pages_count: number | null
          preview_image: string | null
          rating: number | null
          subject: string
          title: string
          university: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_type: string
          downloads_count?: number | null
          file_path?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          pages_count?: number | null
          preview_image?: string | null
          rating?: number | null
          subject: string
          title: string
          university: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_type?: string
          downloads_count?: number | null
          file_path?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          pages_count?: number | null
          preview_image?: string | null
          rating?: number | null
          subject?: string
          title?: string
          university?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      marketplace_favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_inquiries: {
        Row: {
          contact_info: Json | null
          created_at: string
          id: string
          inquirer_id: string
          listing_id: string | null
          message: string
          status: string | null
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string
          id?: string
          inquirer_id: string
          listing_id?: string | null
          message: string
          status?: string | null
        }
        Update: {
          contact_info?: Json | null
          created_at?: string
          id?: string
          inquirer_id?: string
          listing_id?: string | null
          message?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_inquiries_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category: string
          condition: string | null
          contact_info: Json | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          interest_count: number | null
          is_approved: boolean | null
          is_featured: boolean | null
          is_free: boolean | null
          location: string | null
          price: number | null
          status: string | null
          subject: string | null
          title: string
          university: string | null
          updated_at: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          category: string
          condition?: string | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          interest_count?: number | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          location?: string | null
          price?: number | null
          status?: string | null
          subject?: string | null
          title: string
          university?: string | null
          updated_at?: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          category?: string
          condition?: string | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          interest_count?: number | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          location?: string | null
          price?: number | null
          status?: string | null
          subject?: string | null
          title?: string
          university?: string | null
          updated_at?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      past_papers: {
        Row: {
          board: string | null
          created_at: string | null
          downloads: number | null
          file_url: string | null
          grade: string
          id: number
          subject: string
          title: string
          updated_at: string | null
          year: number
        }
        Insert: {
          board?: string | null
          created_at?: string | null
          downloads?: number | null
          file_url?: string | null
          grade: string
          id?: number
          subject: string
          title: string
          updated_at?: string | null
          year: number
        }
        Update: {
          board?: string | null
          created_at?: string | null
          downloads?: number | null
          file_url?: string | null
          grade?: string
          id?: number
          subject?: string
          title?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          document_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          document_id: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          document_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_ratings: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          listing_id: string | null
          rating: number | null
          review: string | null
          seller_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          listing_id?: string | null
          rating?: number | null
          review?: string | null
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string | null
          rating?: number | null
          review?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_ratings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      study_materials: {
        Row: {
          category: string
          created_at: string | null
          date: string | null
          description: string | null
          downloads: number | null
          file_type: string | null
          file_url: string | null
          grade: string
          id: number
          is_featured: boolean | null
          subject: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          date?: string | null
          description?: string | null
          downloads?: number | null
          file_type?: string | null
          file_url?: string | null
          grade: string
          id?: number
          is_featured?: boolean | null
          subject: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          date?: string | null
          description?: string | null
          downloads?: number | null
          file_type?: string | null
          file_url?: string | null
          grade?: string
          id?: number
          is_featured?: boolean | null
          subject?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_queries: {
        Row: {
          created_at: string | null
          email: string
          id: number
          message: string
          name: string
          status: string | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          message: string
          name: string
          status?: string | null
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          message?: string
          name?: string
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role?: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_download_count: {
        Args: { material_id: number; table_name: string }
        Returns: undefined
      }
      increment_listing_interest: {
        Args: { listing_uuid: string }
        Returns: undefined
      }
      increment_listing_views: {
        Args: { listing_uuid: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
