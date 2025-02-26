export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          username: string
          age: number
          city: string
          bio: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          username: string
          age: number
          city: string
          bio?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          username?: string
          age?: number
          city?: string
          bio?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      addictions: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          daily_cost: number
          goal_days: number
          check_ins: number
          streak: number
          progress: number
          saved: number
          visible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon: string
          daily_cost: number
          goal_days: number
          check_ins?: number
          streak?: number
          progress?: number
          saved?: number
          visible?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          daily_cost?: number
          goal_days?: number
          check_ins?: number
          streak?: number
          progress?: number
          saved?: number
          visible?: boolean
          created_at?: string
        }
      }
      supports: {
        Row: {
          id: string
          user_id: string
          supporter_name: string | null
          message: string
          duration: number
          amount: number
          hide_amount: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          supporter_name?: string | null
          message: string
          duration: number
          amount: number
          hide_amount?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          supporter_name?: string | null
          message?: string
          duration?: number
          amount?: number
          hide_amount?: boolean
          created_at?: string
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
  }
}