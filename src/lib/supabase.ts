import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      trades: {
        Row: {
          id: string;
          user_id: string;
          ticker: string;
          entry_price: number;
          exit_price: number | null;
          size: number;
          confidence: number;
          setup_tag: string;
          emotion_tag: string;
          notes: string;
          trade_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ticker: string;
          entry_price: number;
          exit_price?: number | null;
          size: number;
          confidence: number;
          setup_tag: string;
          emotion_tag: string;
          notes?: string;
          trade_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ticker?: string;
          entry_price?: number;
          exit_price?: number | null;
          size?: number;
          confidence?: number;
          setup_tag?: string;
          emotion_tag?: string;
          notes?: string;
          trade_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      insights: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          insight_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          insight_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          insight_type?: string;
          created_at?: string;
        };
      };
    };
  };
};