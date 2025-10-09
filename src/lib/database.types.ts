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
      staff_members: {
        Row: {
          id: string
          user_id: string
          discord_username: string
          role: string
          created_at: string
          approved: boolean
          approved_by: string | null
          approved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          discord_username: string
          role?: string
          created_at?: string
          approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          discord_username?: string
          role?: string
          created_at?: string
          approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
        }
      }
      staff_applications: {
        Row: {
          id: string
          discord_username: string
          discord_id: string
          age: number
          timezone: string
          experience: string
          why_join: string
          availability: string
          additional_info: string | null
          status: string
          created_at: string
          reviewed_by: string | null
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          discord_username: string
          discord_id: string
          age: number
          timezone: string
          experience: string
          why_join: string
          availability: string
          additional_info?: string | null
          status?: string
          created_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          discord_username?: string
          discord_id?: string
          age?: number
          timezone?: string
          experience?: string
          why_join?: string
          availability?: string
          additional_info?: string | null
          status?: string
          created_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
      }
    }
  }
}
