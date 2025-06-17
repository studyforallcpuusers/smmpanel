import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are missing or contain placeholder values
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

if (supabaseUrl === 'your_supabase_project_url_here' || supabaseAnonKey === 'your_supabase_anon_key_here') {
  throw new Error('Please replace the placeholder values in your .env file with your actual Supabase project URL and anon key.')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Please ensure your VITE_SUPABASE_URL is a valid URL (e.g., https://your-project-id.supabase.co)`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          platform: string
          price_per_1000: number
          min_quantity: number
          max_quantity: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          platform: string
          price_per_1000: number
          min_quantity: number
          max_quantity: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          platform?: string
          price_per_1000?: number
          min_quantity?: number
          max_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          service_id: string
          link: string
          quantity: number
          charge: number
          start_count: number
          remains: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          link: string
          quantity: number
          charge: number
          start_count?: number
          remains?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string
          link?: string
          quantity?: number
          charge?: number
          start_count?: number
          remains?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}