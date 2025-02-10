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
      profiles: {
        Row: {
          id: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          role?: string
          created_at?: string
        }
      }
      saidas: {
        Row: {
          id: string
          aluno_nome: string
          aluno_ra: string
          horario_saida: string
          motivo: string | null
          created_at: string
        }
        Insert: {
          id?: string
          aluno_nome: string
          aluno_ra: string
          horario_saida?: string
          motivo?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          aluno_nome?: string
          aluno_ra?: string
          horario_saida?: string
          motivo?: string | null
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