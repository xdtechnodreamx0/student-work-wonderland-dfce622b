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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      award_winners: {
        Row: {
          award: string
          updated_at: string
          winner: string
        }
        Insert: {
          award: string
          updated_at?: string
          winner: string
        }
        Update: {
          award?: string
          updated_at?: string
          winner?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          author_name: string
          author_role: string
          body: string
          created_at: string
          hidden: boolean
          id: string
          user_id: string
        }
        Insert: {
          author_name?: string
          author_role?: string
          body: string
          created_at?: string
          hidden?: boolean
          id?: string
          user_id?: string
        }
        Update: {
          author_name?: string
          author_role?: string
          body?: string
          created_at?: string
          hidden?: boolean
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      club_logins: {
        Row: {
          blocked_until: string | null
          created_at: string
          display_name: string
          failed_attempts: number
          id: string
          kind: Database["public"]["Enums"]["app_role"]
          password_hash: string | null
          signed_in: boolean
          signed_in_at: string | null
          sort_order: number
          user_id: string | null
          username: string | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string
          display_name: string
          failed_attempts?: number
          id?: string
          kind: Database["public"]["Enums"]["app_role"]
          password_hash?: string | null
          signed_in?: boolean
          signed_in_at?: string | null
          sort_order?: number
          user_id?: string | null
          username?: string | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string
          display_name?: string
          failed_attempts?: number
          id?: string
          kind?: Database["public"]["Enums"]["app_role"]
          password_hash?: string | null
          signed_in?: boolean
          signed_in_at?: string | null
          sort_order?: number
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      club_photos: {
        Row: {
          alt: string
          caption: string
          created_at: string
          height: number
          id: string
          path: string
          uploaded_by: string | null
          width: number
        }
        Insert: {
          alt: string
          caption: string
          created_at?: string
          height?: number
          id?: string
          path: string
          uploaded_by?: string | null
          width?: number
        }
        Update: {
          alt?: string
          caption?: string
          created_at?: string
          height?: number
          id?: string
          path?: string
          uploaded_by?: string | null
          width?: number
        }
        Relationships: []
      }
      club_projects: {
        Row: {
          added_by: string | null
          ai_status: string
          blurb: string
          created_at: string
          credit: string
          details: string
          emoji: string
          emoji_reason: string
          emoji_tier: string
          featured: boolean
          group_name: string
          href: string
          id: string
          kind: string
          maker_id: string | null
          maker_name: string
          maker_role: string
          media_key: string | null
          members: string
          poster_url: string | null
          section: string
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
          updated_by: string | null
          video_job_id: string | null
          video_path: string | null
          video_status: string
        }
        Insert: {
          added_by?: string | null
          ai_status?: string
          blurb?: string
          created_at?: string
          credit?: string
          details?: string
          emoji?: string
          emoji_reason?: string
          emoji_tier?: string
          featured?: boolean
          group_name?: string
          href: string
          id?: string
          kind?: string
          maker_id?: string | null
          maker_name?: string
          maker_role?: string
          media_key?: string | null
          members?: string
          poster_url?: string | null
          section?: string
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
          updated_by?: string | null
          video_job_id?: string | null
          video_path?: string | null
          video_status?: string
        }
        Update: {
          added_by?: string | null
          ai_status?: string
          blurb?: string
          created_at?: string
          credit?: string
          details?: string
          emoji?: string
          emoji_reason?: string
          emoji_tier?: string
          featured?: boolean
          group_name?: string
          href?: string
          id?: string
          kind?: string
          maker_id?: string | null
          maker_name?: string
          maker_role?: string
          media_key?: string | null
          members?: string
          poster_url?: string | null
          section?: string
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
          updated_by?: string | null
          video_job_id?: string | null
          video_path?: string | null
          video_status?: string
        }
        Relationships: []
      }
      club_worksheets: {
        Row: {
          added_by: string | null
          created_at: string
          description: string
          id: string
          path: string
          title: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          description?: string
          id?: string
          path: string
          title: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          description?: string
          id?: string
          path?: string
          title?: string
        }
        Relationships: []
      }
      day_notes: {
        Row: {
          day: number
          notes: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          day: number
          notes: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          day?: number
          notes?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      explorer_progress: {
        Row: {
          certificates: Json
          challenges_done: number
          display_name: string
          done_lessons: string[]
          emojis: Json
          game_day: string | null
          game_points: number
          game_points_today: number
          games_played: number
          is_student: boolean
          luck: number
          passed_levels: string[]
          score: number
          summary: string | null
          top_emoji: string | null
          top_emoji_rank: number
          updated_at: string
          user_id: string
        }
        Insert: {
          certificates?: Json
          challenges_done?: number
          display_name: string
          done_lessons?: string[]
          emojis?: Json
          game_day?: string | null
          game_points?: number
          game_points_today?: number
          games_played?: number
          is_student?: boolean
          luck?: number
          passed_levels?: string[]
          score?: number
          summary?: string | null
          top_emoji?: string | null
          top_emoji_rank?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          certificates?: Json
          challenges_done?: number
          display_name?: string
          done_lessons?: string[]
          emojis?: Json
          game_day?: string | null
          game_points?: number
          game_points_today?: number
          games_played?: number
          is_student?: boolean
          luck?: number
          passed_levels?: string[]
          score?: number
          summary?: string | null
          top_emoji?: string | null
          top_emoji_rank?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          username: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          username: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      roster_members: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      student_prompts: {
        Row: {
          created_at: string
          id: string
          prompt: string
          stars: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          stars?: number
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          stars?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_login_password: {
        Args: { _id: string; _password: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_lead: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      my_login_active: { Args: never; Returns: boolean }
      public_rankings: {
        Args: never
        Returns: {
          certificates: number
          challenges_done: number
          display_name: string
          emoji_count: number
          game_points: number
          games_played: number
          lessons: number
          level_count: number
          luck: number
          score: number
          summary: string
          top_emoji: string
          top_emoji_rank: number
        }[]
      }
      release_my_login: { Args: never; Returns: undefined }
      set_login_password: {
        Args: { _id: string; _password: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "teacher" | "mentor" | "student" | "admin"
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
    Enums: {
      app_role: ["teacher", "mentor", "student", "admin"],
    },
  },
} as const
