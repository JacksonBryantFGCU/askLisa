export type Question = {
  id: string;
  name: string | null;
  question: string;
  neighborhood: string | null;
  answer: string | null;
  category: string | null;
  answered_at: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      questions: {
        Row: Question;
        Insert: {
          id?: string;
          name?: string | null;
          question: string;
          neighborhood?: string | null;
          answer?: string | null;
          category?: string | null;
          answered_at?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string | null;
          question?: string;
          neighborhood?: string | null;
          answer?: string | null;
          category?: string | null;
          answered_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
