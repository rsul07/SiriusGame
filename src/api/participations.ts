import api from './index';
import type {Participation} from '@/types';

// Получить все участия для одного мероприятия
export async function getParticipationsApi(eventId: number): Promise<Participation[]> {
    const response = await api.get(`/events/${eventId}/participations`);
    return response.data;
}

// Создать новое участие (команду или личное)
export async function createParticipationApi(eventId: number, data: {
    participant_type: 'team' | 'individual',
    team_name?: string
}): Promise<Participation> {
    const response = await api.post(`/events/${eventId}/participate`, data);
    return response.data;
}

// Присоединиться к команде
export async function joinTeamApi(participationId: number): Promise<void> {
    await api.post(`/participations/${participationId}/join`);
}

// Удалить команду (капитан) / Отменить личное участие
export async function deleteParticipationApi(participationId: number): Promise<void> {
    await api.delete(`/participations/${participationId}`);
}

// Покинуть команду или быть исключенным
export async function leaveOrKickApi(participationId: number, userId: string): Promise<void> {
    await api.delete(`/participations/${participationId}/members/${userId}`);
}

// Получить все мои участия
export async function getMyParticipationsApi(): Promise<Participation[]> {
    const response = await api.get('/users/me/participations');
    return response.data;
}