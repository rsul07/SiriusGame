import api from './index';
import type { IEventCard, IEventDetail, Media, User } from '@/types'

// Общая функция маппинга
function mapEventData(eventData: any) {
    return {
        ...eventData,
        date: eventData.date ? new Date(eventData.date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }) : 'Дата не указана',
        description: eventData.description || 'Описание отсутствует.',
        media: eventData.media || [],
        leaderboard: eventData.leaderboard || [],
        activities: eventData.activities || [],
    };
}

// Возвращает массив "легких" карточек
export async function fetchEventsApi(): Promise<IEventCard[]> {
    try {
        const response = await api.get('/events')
        return response.data.map(mapEventData)
    } catch (error) {
        throw new Error('Не удалось загрузить список мероприятий');
    }
}

// Возвращает одно "тяжелое" событие
export async function fetchEventByIdApi(id: number): Promise<IEventDetail> {
    try {
        const response = await api.get(`/events/${id}`);
        return mapEventData(response.data);
    } catch (error) {
        throw new Error('Не удалось загрузить данные мероприятия');
    }
}

// Создает новое мероприятие
export async function createEventApi(eventData: Partial<IEventDetail>): Promise<number> {
    try {
        const response = await api.post('/events', eventData);
        if (response.data.ok) {
            return response.data.event_id;
        }
        throw new Error('Ошибка создания мероприятия');
    } catch (error) {
        throw new Error('Не удалось создать мероприятие');
    }
}

// Обновляет существующее мероприятие
export async function updateEventApi(id: number, eventData: Partial<IEventDetail>): Promise<boolean> {
    try {
        const response = await api.patch(`/events/${id}`, eventData);
        return response.data.ok;
    } catch (error) {
        throw new Error('Не удалось обновить мероприятие: ' + error);
    }
}

// Добавляет медиа к мероприятию
export async function addEventMediaApi(eventId: number, mediaData: Partial<Media>): Promise<boolean> {
    try {
        const response = await api.post(`/events/${eventId}/media`, mediaData);
        return response.data.ok;
    } catch (error) {
        throw new Error('Не удалось добавить медиа');
    }
}

// Удаляет медиа из мероприятия
export async function deleteEventMediaApi(eventId: number, mediaId: number): Promise<boolean> {
    try {
        const response = await api.delete(`/events/${eventId}/media/${mediaId}`);
        return response.data.ok;
    } catch (error) {
        throw new Error('Не удалось удалить медиа');
    }
}

// Удаляет мероприятие
export async function deleteEventApi(eventId: number): Promise<boolean> {
    try {
        const response = await api.delete(`/events/${eventId}`);
        return response.data.ok;
    } catch (error) {
        throw new Error('Не удалось удалить мероприятие');
    }
}

export async function addJudgeApi(eventId: number, handle: string): Promise<void> {
    await api.post(`/events/${eventId}/judges`, {handle});
}

export async function getJudgesApi(eventId: number): Promise<{ user: User }[]> {
    const response = await api.get(`/events/${eventId}/judges`);
    return response.data;
}

export async function getLeaderboardApi(eventId: number): Promise<any[]> {
    const response = await api.get(`/events/${eventId}/leaderboard`);
    return response.data;
}