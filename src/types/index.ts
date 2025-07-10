export interface Leader { id: number; name: string; score: number; avatarUrl: string }
export interface Activity { icon: string; name: string; color: string }
export interface Media { id: number; url: string; media_type: 'image' | 'document'; name?: string; order: number }
export interface User { /* ... */ }

// "Легкий" интерфейс для карточек, как его отдает API
export interface IEventCard {
  id: number;
  title: string;
  is_team: boolean;
  date: string;
  state: 'future' | 'current' | 'past';
  preview_url: string | null; // <-- ИЗМЕНЕНИЕ: Добавляем поле из API
  leaderboard?: Leader[];
}

// "Тяжелый" интерфейс для детальной страницы
export interface IEventDetail extends IEventCard {
  description: string;
  media: Media[]; // <-- Здесь остается полный массив медиа
  start_time?: string;
  end_time?: string;
  max_members?: number;
  max_teams?: number;
  leaderboard?: Leader[];
  activities?: Activity[];
}