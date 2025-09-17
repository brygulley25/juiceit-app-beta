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
      recipes: {
        Row: {
          id: string
          name: string
          mood: string
          goal: string
          ingredients: Json
          instructions: string[]
          benefits: string
          prep_time: string
          servings: string
          color: string[]
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          mood: string
          goal: string
          ingredients?: Json
          instructions?: string[]
          benefits?: string
          prep_time?: string
          servings?: string
          color?: string[]
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          mood?: string
          goal?: string
          ingredients?: Json
          instructions?: string[]
          benefits?: string
          prep_time?: string
          servings?: string
          color?: string[]
          created_at?: string | null
        }
      }
      recipe_ratings: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          overall_rating: number
          taste_rating: number
          energy_rating: number
          satisfaction_rating: number
          would_make_again: boolean
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          overall_rating: number
          taste_rating: number
          energy_rating: number
          satisfaction_rating: number
          would_make_again?: boolean
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          overall_rating?: number
          taste_rating?: number
          energy_rating?: number
          satisfaction_rating?: number
          would_make_again?: boolean
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_checkins: {
        Row: {
          id: string
          user_id: string
          checkin_date: string
          mood: string
          energy_level: number
          motivation_level: number
          notes: string
          recipes_tried: Json
          feeling_after: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          checkin_date?: string
          mood?: string
          energy_level?: number
          motivation_level?: number
          notes?: string
          recipes_tried?: Json
          feeling_after?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          checkin_date?: string
          mood?: string
          energy_level?: number
          motivation_level?: number
          notes?: string
          recipes_tried?: Json
          feeling_after?: Json | null
          created_at?: string
        }
      }
      saved_recipes: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          streak: number | null
          total_recipes_tried: number | null
          created_at: string | null
          updated_at: string | null
          dietary_restrictions: Json | null
          allergies: Json | null
          recently_viewed: Json | null
        }
        Insert: {
          id: string
          email: string
          streak?: number | null
          total_recipes_tried?: number | null
          created_at?: string | null
          updated_at?: string | null
          dietary_restrictions?: Json | null
          allergies?: Json | null
          recently_viewed?: Json | null
        }
        Update: {
          id?: string
          email?: string
          streak?: number | null
          total_recipes_tried?: number | null
          created_at?: string | null
          updated_at?: string | null
          dietary_restrictions?: Json | null
          allergies?: Json | null
          recently_viewed?: Json | null
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