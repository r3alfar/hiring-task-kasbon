export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      debts: {
        Row: {
          id: string
          user_id: string
          type: 'owed_to_me' | 'i_owe'
          counterpart_name: string
          amount: number
          note: string | null
          due_date: string | null
          settled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'owed_to_me' | 'i_owe'
          counterpart_name: string
          amount: number
          note?: string | null
          due_date?: string | null
          settled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'owed_to_me' | 'i_owe'
          counterpart_name?: string
          amount?: number
          note?: string | null
          due_date?: string | null
          settled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
