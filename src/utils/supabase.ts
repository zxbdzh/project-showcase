import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          website: string | null
          github_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username?: string | null
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string | null
          demo_url: string | null
          github_url: string | null
          featured: boolean
          status: 'draft' | 'published' | 'archived'
          sort_order: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content?: string | null
          demo_url?: string | null
          github_url?: string | null
          featured?: boolean
          status?: 'draft' | 'published' | 'archived'
          sort_order?: number
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string | null
          demo_url?: string | null
          github_url?: string | null
          featured?: boolean
          status?: 'draft' | 'published' | 'archived'
          sort_order?: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string | null
          icon: string | null
          sort_order: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          icon?: string | null
          sort_order?: number
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          sort_order?: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_categories: {
        Row: {
          project_id: string
          category_id: string
        }
        Insert: {
          project_id: string
          category_id: string
        }
        Update: {
          project_id?: string
          category_id?: string
        }
      }
      project_tags: {
        Row: {
          project_id: string
          tag_id: string
        }
        Insert: {
          project_id: string
          tag_id: string
        }
        Update: {
          project_id?: string
          tag_id?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string
          level: number
          years_experience: number | null
          projects_count: number
          icon: string | null
          color: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          level: number
          years_experience?: number | null
          projects_count?: number
          icon?: string | null
          color?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          level?: number
          years_experience?: number | null
          projects_count?: number
          icon?: string | null
          color?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      social_links: {
        Row: {
          id: string
          name: string
          url: string
          icon: string | null
          sort_order: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          icon?: string | null
          sort_order?: number
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          icon?: string | null
          sort_order?: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: string | null
          description: string | null
          type: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          description?: string | null
          type?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          description?: string | null
          type?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// 类型别名
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Skill = Database['public']['Tables']['skills']['Row']
export type SocialLink = Database['public']['Tables']['social_links']['Row']
export type SystemSetting = Database['public']['Tables']['system_settings']['Row']

export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
