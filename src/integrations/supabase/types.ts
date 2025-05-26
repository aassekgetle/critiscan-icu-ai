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
      payment_logs: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          error_message: string | null
          event_type: string
          function_name: string
          id: string
          ip_address: string | null
          order_id: string | null
          request_data: Json | null
          response_data: Json | null
          status: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          error_message?: string | null
          event_type: string
          function_name: string
          id?: string
          ip_address?: string | null
          order_id?: string | null
          request_data?: Json | null
          response_data?: Json | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          error_message?: string | null
          event_type?: string
          function_name?: string
          id?: string
          ip_address?: string | null
          order_id?: string | null
          request_data?: Json | null
          response_data?: Json | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string | null
          verification_notes: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          failed_payment_count: number | null
          id: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_period: Database["public"]["Enums"]["subscription_period"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          failed_payment_count?: number | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_period: Database["public"]["Enums"]["subscription_period"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          failed_payment_count?: number | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_period?: Database["public"]["Enums"]["subscription_period"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
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
      verification_documents: {
        Row: {
          document_type: string
          file_name: string
          file_path: string
          id: string
          reviewed_at: string | null
          reviewer_notes: string | null
          uploaded_at: string | null
          user_id: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          document_type: string
          file_name: string
          file_path: string
          id?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          uploaded_at?: string | null
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          document_type?: string
          file_name?: string
          file_path?: string
          id?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          uploaded_at?: string | null
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_period: "monthly" | "yearly"
      subscription_status: "active" | "canceled" | "past_due" | "incomplete"
      subscription_tier: "student" | "nurse" | "doctor" | "teacher"
      verification_status: "pending" | "approved" | "rejected" | "under_review"
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
      subscription_period: ["monthly", "yearly"],
      subscription_status: ["active", "canceled", "past_due", "incomplete"],
      subscription_tier: ["student", "nurse", "doctor", "teacher"],
      verification_status: ["pending", "approved", "rejected", "under_review"],
    },
  },
} as const
