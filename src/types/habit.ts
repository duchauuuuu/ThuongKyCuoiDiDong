export interface Habit {
  id?: number;
  title: string;
  description: string | null;
  active: number;
  done_today: number;
  created_at: number;
}

