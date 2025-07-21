export interface Media {
    id: number;
    url: string;
    media_type: 'image' | 'document';
    name?: string;
    order: number
}

export interface Leader {
    id: number;
    name: string;
    score: number;
    avatarUrl: string | undefined
    is_team?: boolean
}

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
    teamId?: number | null;
    isCaptain?: boolean;
}

export interface UserPublic {
    id: string;
    handle: string;
    full_name: string;
    avatar_url?: string;
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

export interface ParticipationMember {
    user: UserPublic;
}

export interface Participation {
    id: number;
    event_id: number;
    participant_type: 'individual' | 'team';
    team_name: string | null;
    team_avatar_url: string | null;
    creator: User;
    members: ParticipationMember[];
}

export interface LeaderboardEntry {
    participation: Participation;
    total_score: number;
}