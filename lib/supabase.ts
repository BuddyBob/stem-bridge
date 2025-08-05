import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          date: string
          start_time: string
          format: "virtual" | "in_person" | "hybrid" | null
          location: string | null
          short_description: string
          description: string | null
          image_url: string | null
          signup_link: string
          signup_clicks: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          start_time: string
          format?: "virtual" | "in_person" | "hybrid" | null
          location?: string | null
          short_description: string
          description?: string | null
          image_url?: string | null
          signup_link: string
          signup_clicks?: number
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          start_time?: string
          format?: "virtual" | "in_person" | "hybrid" | null
          location?: string | null
          short_description?: string
          description?: string | null
          image_url?: string | null
          signup_link?: string
          signup_clicks?: number
          created_by?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          is_admin?: boolean
          created_at?: string
        }
      }
    }
  }
}
