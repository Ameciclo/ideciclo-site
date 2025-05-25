export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cities: {
        Row: {
          created_at: string
          extensao_avaliada: number | null
          id: string
          ideciclo: number | null
          name: string
          state: string
          updated_at: string
          vias_alimentadoras_km: number | null
          vias_estruturais_km: number | null
          vias_locais_km: number | null
        }
        Insert: {
          created_at?: string
          extensao_avaliada?: number | null
          id: string
          ideciclo?: number | null
          name: string
          state: string
          updated_at?: string
          vias_alimentadoras_km?: number | null
          vias_estruturais_km?: number | null
          vias_locais_km?: number | null
        }
        Update: {
          created_at?: string
          extensao_avaliada?: number | null
          id?: string
          ideciclo?: number | null
          name?: string
          state?: string
          updated_at?: string
          vias_alimentadoras_km?: number | null
          vias_estruturais_km?: number | null
          vias_locais_km?: number | null
        }
        Relationships: []
      }
      forms: {
        Row: {
          blocks_count: number | null
          city_id: string
          created_at: string
          date: string | null
          end_point: string | null
          extension: number | null
          hierarchy: string | null
          id: string
          intersections_count: number | null
          neighborhood: string | null
          observations: string | null
          researcher: string | null
          responses: Json | null
          segment_id: string
          start_point: string | null
          street_name: string | null
          updated_at: string
          velocity: number | null
        }
        Insert: {
          blocks_count?: number | null
          city_id: string
          created_at?: string
          date?: string | null
          end_point?: string | null
          extension?: number | null
          hierarchy?: string | null
          id: string
          intersections_count?: number | null
          neighborhood?: string | null
          observations?: string | null
          researcher?: string | null
          responses?: Json | null
          segment_id: string
          start_point?: string | null
          street_name?: string | null
          updated_at?: string
          velocity?: number | null
        }
        Update: {
          blocks_count?: number | null
          city_id?: string
          created_at?: string
          date?: string | null
          end_point?: string | null
          extension?: number | null
          hierarchy?: string | null
          id?: string
          intersections_count?: number | null
          neighborhood?: string | null
          observations?: string | null
          researcher?: string | null
          responses?: Json | null
          segment_id?: string
          start_point?: string | null
          street_name?: string | null
          updated_at?: string
          velocity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          form_id: string
          id: string
          rating: number
          rating_name: Database["public"]["Enums"]["rating_type"]
          weight: number
        }
        Insert: {
          created_at?: string
          form_id: string
          id: string
          rating: number
          rating_name: Database["public"]["Enums"]["rating_type"]
          weight: number
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          rating?: number
          rating_name?: Database["public"]["Enums"]["rating_type"]
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          created_at: string
          evaluated: boolean | null
          geometry: Json | null
          id: string
          id_cidade: string
          id_form: string | null
          length: number
          name: string
          neighborhood: string | null
          selected: boolean | null
          type: Database["public"]["Enums"]["segment_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          evaluated?: boolean | null
          geometry?: Json | null
          id: string
          id_cidade: string
          id_form?: string | null
          length: number
          name: string
          neighborhood?: string | null
          selected?: boolean | null
          type: Database["public"]["Enums"]["segment_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          evaluated?: boolean | null
          geometry?: Json | null
          id?: string
          id_cidade?: string
          id_form?: string | null
          length?: number
          name?: string
          neighborhood?: string | null
          selected?: boolean | null
          type?: Database["public"]["Enums"]["segment_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "segments_id_cidade_fkey"
            columns: ["id_cidade"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      rating_type: "A" | "B" | "C" | "D"
      segment_type: "Ciclofaixa" | "Ciclovia" | "Ciclorrota" | "Compartilhada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      rating_type: ["A", "B", "C", "D"],
      segment_type: ["Ciclofaixa", "Ciclovia", "Ciclorrota", "Compartilhada"],
    },
  },
} as const
