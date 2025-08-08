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
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          is_system_generated: boolean | null
          name: string
          points_required: number | null
          rarity: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          is_system_generated?: boolean | null
          name: string
          points_required?: number | null
          rarity?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_system_generated?: boolean | null
      invoices: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          status: 'pending' | 'paid' | 'cancelled';
          items: any[];
          due_date: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string | null;
        }
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          status?: 'pending' | 'paid' | 'cancelled';
          items?: any[];
          due_date?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
        }
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          status?: 'pending' | 'paid' | 'cancelled';
          items?: any[];
          due_date?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
        }
        Relationships: []
      },
          name?: string
          points_required?: number | null
          rarity?: string | null
          updated_at?: string
        }
        Relationships: []
      }
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
      bookmarks: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          user_id?: string
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
      daily_planner: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_time: number | null
          id: string
          is_completed: boolean | null
          pomodoro_sessions: number | null
          priority: string | null
          task_title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_time?: number | null
          id?: string
          is_completed?: boolean | null
          pomodoro_sessions?: number | null
          priority?: string | null
          task_title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_time?: number | null
          id?: string
          is_completed?: boolean | null
          pomodoro_sessions?: number | null
          priority?: string | null
          task_title?: string
          updated_at?: string | null
          user_id?: string
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
          file_size: number | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          mime_type: string | null
          pages_count: number | null
          preview_image: string | null
          rating: number | null
          storage_path: string | null
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
          file_size?: number | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          mime_type?: string | null
          pages_count?: number | null
          preview_image?: string | null
          rating?: number | null
          storage_path?: string | null
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
          file_size?: number | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          mime_type?: string | null
          pages_count?: number | null
          preview_image?: string | null
          rating?: number | null
          storage_path?: string | null
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
      events: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          is_featured: boolean | null
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          region: string | null
          registration_deadline: string | null
          start_date: string
          stream: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type: string
          id?: string
          is_featured?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          region?: string | null
          registration_deadline?: string | null
          start_date: string
          stream?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_featured?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          region?: string | null
          registration_deadline?: string | null
          start_date?: string
          stream?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          bucket_name: string
          created_at: string | null
          file_name: string
          file_size: number
          id: string
          metadata: Json | null
          mime_type: string
          original_name: string
          storage_path: string
          updated_at: string | null
          upload_status: string
          user_id: string
        }
        Insert: {
          bucket_name?: string
          created_at?: string | null
          file_name: string
          file_size: number
          id?: string
          metadata?: Json | null
          mime_type: string
          original_name: string
          storage_path: string
          updated_at?: string | null
          upload_status?: string
          user_id: string
        }
        Update: {
          bucket_name?: string
          created_at?: string | null
          file_name?: string
          file_size?: number
          id?: string
          metadata?: Json | null
          mime_type?: string
          original_name?: string
          storage_path?: string
          updated_at?: string | null
          upload_status?: string
          user_id?: string
        }
        Relationships: []
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
      job_listings: {
        Row: {
          application_deadline: string | null
          application_url: string | null
          company: string
          created_at: string | null
          description: string | null
          experience_required: string | null
          id: string
          is_featured: boolean | null
          is_remote: boolean | null
          is_verified: boolean | null
          job_type: string
          location: string | null
          salary_max: number | null
          salary_min: number | null
          skills_required: string[] | null
          stipend: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          application_deadline?: string | null
          application_url?: string | null
          company: string
          created_at?: string | null
          description?: string | null
          experience_required?: string | null
          id?: string
          is_featured?: boolean | null
          is_remote?: boolean | null
          is_verified?: boolean | null
          job_type: string
          location?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          stipend?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          application_deadline?: string | null
          application_url?: string | null
          company?: string
          created_at?: string | null
          description?: string | null
          experience_required?: string | null
          id?: string
          is_featured?: boolean | null
          is_remote?: boolean | null
          is_verified?: boolean | null
          job_type?: string
          location?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          stipend?: number | null
          title?: string
          updated_at?: string | null
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
      merch_orders: {
        Row: {
          created_at: string | null
          id: string
          order_status: string | null
          payment_id: string | null
          product_id: string
          quantity: number
          shipping_address: Json
          total_amount: number
          tracking_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_status?: string | null
          payment_id?: string | null
          product_id: string
          quantity?: number
          shipping_address: Json
          total_amount: number
          tracking_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_status?: string | null
          payment_id?: string | null
          product_id?: string
          quantity?: number
          shipping_address?: Json
          total_amount?: number
          tracking_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merch_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "merch_store"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_store: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_print_on_demand: boolean | null
          name: string
          price: number
          printify_product_id: string | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_print_on_demand?: boolean | null
          name: string
          price: number
          printify_product_id?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_print_on_demand?: boolean | null
          name?: string
          price?: number
          printify_product_id?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mind_maps: {
        Row: {
          created_at: string | null
          created_by: string | null
          grade: string
          id: string
          is_public: boolean | null
          map_data: Json
          subject: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          grade: string
          id?: string
          is_public?: boolean | null
          map_data: Json
          subject: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          grade?: string
          id?: string
          is_public?: boolean | null
          map_data?: Json
          subject?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          buyer_id: string
          commission_amount: number | null
          commission_rate: number | null
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          seller_amount: number | null
          seller_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          seller_amount?: number | null
          seller_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          seller_amount?: number | null
          seller_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      past_papers: {
        Row: {
          author_id: string | null
          board: string | null
          created_at: string | null
          downloads: number | null
          file_url: string | null
          grade: string
          id: number
          rating: number | null
          subject: string
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
          year: number
        }
        Insert: {
          author_id?: string | null
          board?: string | null
          created_at?: string | null
          downloads?: number | null
          file_url?: string | null
          grade: string
          id?: number
          rating?: number | null
          subject: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
          year: number
        }
        Update: {
          author_id?: string | null
          board?: string | null
          created_at?: string | null
          downloads?: number | null
          file_url?: string | null
          grade?: string
          id?: number
          rating?: number | null
          subject?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
          year?: number
        }
        Relationships: []
      }
      payment_verifications: {
        Row: {
          admin_notes: string | null
          buyer_id: string
          created_at: string | null
          esewa_transaction_id: string | null
          id: string
          order_id: string
          payment_amount: number | null
          receipt_file_path: string | null
          status: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          buyer_id: string
          created_at?: string | null
          esewa_transaction_id?: string | null
          id?: string
          order_id: string
          payment_amount?: number | null
          receipt_file_path?: string | null
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          buyer_id?: string
          created_at?: string | null
          esewa_transaction_id?: string | null
          id?: string
          order_id?: string
          payment_amount?: number | null
          receipt_file_path?: string | null
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_verifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_study_materials: {
        Row: {
          admin_notes: string | null
          author_id: string
          category: string
          created_at: string | null
          description: string | null
          file_url: string | null
          grade: string
          id: number
          status: string | null
          subject: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          author_id: string
          category: string
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          grade: string
          id?: number
          status?: string | null
          subject: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          author_id?: string
          category?: string
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          grade?: string
          id?: number
          status?: string | null
          subject?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pomodoro_sessions: {
        Row: {
          break_duration: number
          completed_at: string | null
          id: string
          session_duration: number
          task_id: string | null
          user_id: string
        }
        Insert: {
          break_duration?: number
          completed_at?: string | null
          id?: string
          session_duration?: number
          task_id?: string | null
          user_id: string
        }
        Update: {
          break_duration?: number
          completed_at?: string | null
          id?: string
          session_duration?: number
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pomodoro_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "daily_planner"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          plan_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          plan_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          plan_type?: string
          status?: string
          updated_at?: string
          user_id?: string
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
      referral_program: {
        Row: {
          created_at: string | null
          current_month_referrals: number | null
          id: string
          rank_position: number | null
          referral_code: string
          total_referrals: number | null
          total_rewards_earned: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_month_referrals?: number | null
          id?: string
          rank_position?: number | null
          referral_code: string
          total_referrals?: number | null
          total_rewards_earned?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_month_referrals?: number | null
          id?: string
          rank_position?: number | null
          referral_code?: string
          total_referrals?: number | null
          total_rewards_earned?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referral_transactions: {
        Row: {
          created_at: string | null
          id: string
          referred_user_id: string
          referrer_id: string
          reward_amount: number | null
          reward_type: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referred_user_id: string
          referrer_id: string
          reward_amount?: number | null
          reward_type?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referred_user_id?: string
          referrer_id?: string
          reward_amount?: number | null
          reward_type?: string | null
          status?: string | null
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          clicked_result_id: string | null
          id: string
          results_count: number | null
          search_category: string | null
          search_query: string
          search_timestamp: string | null
          user_id: string | null
        }
        Insert: {
          clicked_result_id?: string | null
          id?: string
          results_count?: number | null
          search_category?: string | null
          search_query: string
          search_timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_result_id?: string | null
          id?: string
          results_count?: number | null
          search_category?: string | null
          search_query?: string
          search_timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      seller_wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          esewa_id: string | null
          esewa_qr_code: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          esewa_id?: string | null
          esewa_qr_code?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          esewa_id?: string | null
          esewa_qr_code?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      student_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          points_earned: number | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          points_earned?: number | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          points_earned?: number | null
          user_id?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          achievements: Json | null
          bio: string | null
          course: string | null
          created_at: string
          id: string
          level: string | null
          points: number | null
          profile_image: string | null
          total_downloads: number | null
          total_sales: number | null
          total_uploads: number | null
          university: string | null
          updated_at: string
          user_id: string
          year_of_study: number | null
        }
        Insert: {
          achievements?: Json | null
          bio?: string | null
          course?: string | null
          created_at?: string
          id?: string
          level?: string | null
          points?: number | null
          profile_image?: string | null
          total_downloads?: number | null
          total_sales?: number | null
          total_uploads?: number | null
          university?: string | null
          updated_at?: string
          user_id: string
          year_of_study?: number | null
        }
        Update: {
          achievements?: Json | null
          bio?: string | null
          course?: string | null
          created_at?: string
          id?: string
          level?: string | null
          points?: number | null
          profile_image?: string | null
          total_downloads?: number | null
          total_sales?: number | null
          total_uploads?: number | null
          university?: string | null
          updated_at?: string
          user_id?: string
          year_of_study?: number | null
        }
        Relationships: []
      }
      study_materials: {
        Row: {
          author_id: string | null
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
          rating: number | null
          subject: string
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
          approval_status: string | null
        }
        Insert: {
          author_id?: string | null
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
          rating?: number | null
          subject: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
          approval_status?: string | null
        }
        Update: {
          author_id?: string | null
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
          rating?: number | null
          subject?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
          approval_status?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          awarded_by_admin: string | null
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id?: string | null
          awarded_by_admin?: string | null
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string | null
          awarded_by_admin?: string | null
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "seller_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          esewa_id: string
          id: string
          processed_at: string | null
          processed_by: string | null
          seller_id: string
          status: string | null
          updated_at: string | null
          wallet_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          esewa_id: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          seller_id: string
          status?: string | null
          updated_at?: string | null
          wallet_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          esewa_id?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          seller_id?: string
          status?: string | null
          updated_at?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "seller_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_dashboard_stats: {
        Row: {
          level: string | null
          points: number | null
          total_activities: number | null
          total_bookmarks: number | null
          total_downloads: number | null
          total_sales: number | null
          total_uploads: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_student_activity: {
        Args: {
          p_user_id: string
          p_activity_type: string
          p_points?: number
          p_description?: string
        }
        Returns: undefined
      }
      admin_grant_achievement: {
        Args: {
          p_user_id: string
          p_achievement_id: string
          p_admin_id: string
        }
        Returns: undefined
      }
      calculate_user_level: {
        Args: { points: number }
        Returns: string
      }
      check_and_grant_achievements: {
        Args: { p_user_id: string; p_points: number }
        Returns: undefined
      }
      complete_file_upload: {
        Args: { p_upload_id: string; p_storage_path: string }
        Returns: undefined
      }
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
      increment_material_views: {
        Args: { material_id: number; table_name: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_premium_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      process_order_payment: {
        Args: { p_order_id: string; p_admin_id: string }
        Returns: undefined
      }
      update_wallet_balance: {
        Args: {
          p_wallet_id: string
          p_amount: number
          p_transaction_type: string
          p_description?: string
          p_reference_id?: string
        }
        Returns: undefined
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
