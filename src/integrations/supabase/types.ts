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
      abg_results: {
        Row: {
          anion_gap: number | null
          base_excess: number | null
          created_at: string | null
          fio2: number | null
          hco3: number | null
          id: string
          image_path: string | null
          notes: string | null
          paco2: number | null
          pao2: number | null
          patient_id: string | null
          ph: number | null
        }
        Insert: {
          anion_gap?: number | null
          base_excess?: number | null
          created_at?: string | null
          fio2?: number | null
          hco3?: number | null
          id?: string
          image_path?: string | null
          notes?: string | null
          paco2?: number | null
          pao2?: number | null
          patient_id?: string | null
          ph?: number | null
        }
        Update: {
          anion_gap?: number | null
          base_excess?: number | null
          created_at?: string | null
          fio2?: number | null
          hco3?: number | null
          id?: string
          image_path?: string | null
          notes?: string | null
          paco2?: number | null
          pao2?: number | null
          patient_id?: string | null
          ph?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "abg_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          calcium: number | null
          created_at: string | null
          creatinine: number | null
          hemoglobin: number | null
          id: string
          image_path: string | null
          lactate: number | null
          magnesium: number | null
          notes: string | null
          patient_id: string | null
          potassium: number | null
          sodium: number | null
        }
        Insert: {
          calcium?: number | null
          created_at?: string | null
          creatinine?: number | null
          hemoglobin?: number | null
          id?: string
          image_path?: string | null
          lactate?: number | null
          magnesium?: number | null
          notes?: string | null
          patient_id?: string | null
          potassium?: number | null
          sodium?: number | null
        }
        Update: {
          calcium?: number | null
          created_at?: string | null
          creatinine?: number | null
          hemoglobin?: number | null
          id?: string
          image_path?: string | null
          lactate?: number | null
          magnesium?: number | null
          notes?: string | null
          patient_id?: string | null
          potassium?: number | null
          sodium?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          id: string
          medical_record_number: string | null
          name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          medical_record_number?: string | null
          name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          medical_record_number?: string | null
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      treatment_plans: {
        Row: {
          abg_id: string | null
          created_at: string | null
          id: string
          immediate_actions: Json | null
          lab_id: string | null
          medication_orders: Json | null
          monitoring_plan: Json | null
          notes: string | null
          patient_id: string | null
          ventilator_adjustments: Json | null
          ventilator_id: string | null
        }
        Insert: {
          abg_id?: string | null
          created_at?: string | null
          id?: string
          immediate_actions?: Json | null
          lab_id?: string | null
          medication_orders?: Json | null
          monitoring_plan?: Json | null
          notes?: string | null
          patient_id?: string | null
          ventilator_adjustments?: Json | null
          ventilator_id?: string | null
        }
        Update: {
          abg_id?: string | null
          created_at?: string | null
          id?: string
          immediate_actions?: Json | null
          lab_id?: string | null
          medication_orders?: Json | null
          monitoring_plan?: Json | null
          notes?: string | null
          patient_id?: string | null
          ventilator_adjustments?: Json | null
          ventilator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_abg_id_fkey"
            columns: ["abg_id"]
            isOneToOne: false
            referencedRelation: "abg_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "lab_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_ventilator_id_fkey"
            columns: ["ventilator_id"]
            isOneToOne: false
            referencedRelation: "ventilator_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      ventilator_settings: {
        Row: {
          created_at: string | null
          fio2: number | null
          id: string
          image_path: string | null
          mode: string | null
          notes: string | null
          patient_id: string | null
          peep: number | null
          respiratory_rate: number | null
          tidal_volume: number | null
        }
        Insert: {
          created_at?: string | null
          fio2?: number | null
          id?: string
          image_path?: string | null
          mode?: string | null
          notes?: string | null
          patient_id?: string | null
          peep?: number | null
          respiratory_rate?: number | null
          tidal_volume?: number | null
        }
        Update: {
          created_at?: string | null
          fio2?: number | null
          id?: string
          image_path?: string | null
          mode?: string | null
          notes?: string | null
          patient_id?: string | null
          peep?: number | null
          respiratory_rate?: number | null
          tidal_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ventilator_settings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
