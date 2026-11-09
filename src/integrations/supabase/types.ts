export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip: string | null
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      dispute_analyses: {
        Row: {
          confidence: number
          created_at: string
          dispute_id: string
          draft_email: string
          id: string
          language: string
          leverage_points: Json
          model: string
          parent_analysis_id: string | null
          recommendation: string
          risk_level: string
          sources: Json
          user_id: string
        }
        Insert: {
          confidence: number
          created_at?: string
          dispute_id: string
          draft_email: string
          id?: string
          language?: string
          leverage_points?: Json
          model: string
          parent_analysis_id?: string | null
          recommendation: string
          risk_level: string
          sources?: Json
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          dispute_id?: string
          draft_email?: string
          id?: string
          language?: string
          leverage_points?: Json
          model?: string
          parent_analysis_id?: string | null
          recommendation?: string
          risk_level?: string
          sources?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_analyses_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_analyses_parent_analysis_id_fkey"
            columns: ["parent_analysis_id"]
            isOneToOne: false
            referencedRelation: "dispute_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_events: {
        Row: {
          created_at: string
          dispute_id: string
          id: string
          note: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dispute_id: string
          id?: string
          note?: string | null
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          dispute_id?: string
          id?: string
          note?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_events_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_evidence: {
        Row: {
          created_at: string
          dispute_id: string
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dispute_id: string
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          dispute_id?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_evidence_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          amount: number | null
          case_status: string
          case_status_at: string
          category: string
          city: string | null
          country: string
          created_at: string
          currency: string | null
          id: string
          incident_date: string | null
          paid: boolean
          paid_at: string | null
          recovered_amount: number | null
          status: string
          story: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          case_status?: string
          case_status_at?: string
          category: string
          city?: string | null
          country: string
          created_at?: string
          currency?: string | null
          id?: string
          incident_date?: string | null
          paid?: boolean
          paid_at?: string | null
          recovered_amount?: number | null
          status?: string
          story: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          case_status?: string
          case_status_at?: string
          category?: string
          city?: string | null
          country?: string
          created_at?: string
          currency?: string | null
          id?: string
          incident_date?: string | null
          paid?: boolean
          paid_at?: string | null
          recovered_amount?: number | null
          status?: string
          story?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expert_help_requests: {
        Row: {
          case_summary: string | null
          contact_email: string
          created_at: string
          dispute_id: string | null
          id: string
          notes: string | null
          preferred_date: string | null
          preferred_slot: string | null
          status: string
          timezone: string | null
          user_id: string | null
        }
        Insert: {
          case_summary?: string | null
          contact_email: string
          created_at?: string
          dispute_id?: string | null
          id?: string
          notes?: string | null
          preferred_date?: string | null
          preferred_slot?: string | null
          status?: string
          timezone?: string | null
          user_id?: string | null
        }
        Update: {
          case_summary?: string | null
          contact_email?: string
          created_at?: string
          dispute_id?: string | null
          id?: string
          notes?: string | null
          preferred_date?: string | null
          preferred_slot?: string | null
          status?: string
          timezone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_help_requests_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      ota_rules_cache: {
        Row: {
          content_hash: string
          fetched_at: string
          id: string
          ota_name: string
          raw_content: string
          source_url: string
          updated_at: string
        }
        Insert: {
          content_hash: string
          fetched_at?: string
          id?: string
          ota_name: string
          raw_content: string
          source_url: string
          updated_at?: string
        }
        Update: {
          content_hash?: string
          fetched_at?: string
          id?: string
          ota_name?: string
          raw_content?: string
          source_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          dispute_id: string
          id: string
          paypal_order_id: string
          provider: string
          raw_payload: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          dispute_id: string
          id?: string
          paypal_order_id: string
          provider?: string
          raw_payload?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          dispute_id?: string
          id?: string
          paypal_order_id?: string
          provider?: string
          raw_payload?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit_events: {
        Row: {
          action: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      special_code_redemptions: {
        Row: {
          created_at: string
          dispute_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dispute_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dispute_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_code_redemptions_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: true
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      special_code_settings: {
        Row: {
          active: boolean
          expires_at: string | null
          id: number
          max_uses: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          expires_at?: string | null
          id?: number
          max_uses?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          expires_at?: string | null
          id?: number
          max_uses?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      redeem_special_code: {
        Args: { _dispute_id: string; _user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
