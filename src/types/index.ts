export interface Media { id: number; url: string; media_type: 'image' | 'document'; name?: string; order: number }
export interface Leader { id: number; name: string; score: number; avatarUrl: string }

export interface User {
  id: string;
  handle: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'organizer' | 'judge' | 'user';
  avatarUrl?: string;
  height?: number;
  weight?: number;
  birthday?: string;
  gender?: 'male' | 'female';
  is2FAEnabled?: boolean;
  teamId?: number | null; // <-- ДОБАВЛЕНО
  isCaptain?: boolean;    // <-- ДОБАВЛЕНО
}

export interface Activity {
  id: number;
  name: string;
  icon?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_scoreable: boolean;
  is_versus: boolean;
  max_score?: number | null;
  start_dt?: string | null;
  end_dt?: string | null; 
}

// "Легкий" интерфейс для карточек, как его отдает API
export interface IEventCard {
  id: number;
  title: string;
  is_team: boolean;
  date: string;
  state: 'future' | 'current' | 'past';
  preview_url: string | null;
  leaderboard?: Leader[];
}

// "Тяжелый" интерфейс для детальной страницы
export interface IEventDetail extends IEventCard {
  description: string;
  media: Media[];
  start_time?: string;
  end_time?: string;
  max_members?: number;
  max_teams?: number | null;
  leaderboard?: Leader[];
  activities?: Activity[];
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  birthday: string;
  gender: 'male' | 'female';
}