export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          password_hash: string;
          role: 'member' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          password_hash: string;
          role?: 'member' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
        Relationships: [];
      };
      spaces: {
        Row: {
          id: string;
          name: string;
          type: string;
          description: string;
          capacity: number;
          status: 'available' | 'unavailable';
          amenities: string[];
          image_url: string | null;
          image_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          description: string;
          capacity: number;
          status?: 'available' | 'unavailable';
          amenities?: string[];
          image_url?: string | null;
          image_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['spaces']['Insert']>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          space_id: string;
          member_id: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status: 'pending' | 'approved' | 'rejected' | 'cancelled';
          reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          member_id: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'bookings_space_id_fkey';
            columns: ['space_id'];
            isOneToOne: false;
            referencedRelation: 'spaces';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_member_id_fkey';
            columns: ['member_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      refresh_sessions: {
        Row: {
          id: string;
          user_id: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          expires_at: string;
          created_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['refresh_sessions']['Insert']
        >;
        Relationships: [
          {
            foreignKeyName: 'refresh_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'member' | 'admin';
      space_status: 'available' | 'unavailable';
      booking_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    };
    CompositeTypes: Record<string, never>;
  };
};
