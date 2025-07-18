import api from './index';
import type { IEventCard, IEventDetail, Media, Activity } from '@/types'

// Общая функция обработки ошибок API
function handleApiError(error: any, defaultMessage: string): never {
  let errorMessage = 'Неизвестная ошибка';
  
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    
    // Если detail - это массив объектов с полем msg
    if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
      errorMessage = detail.map(item => item.msg).join(', ');
    }
    // Если detail - это строка
    else if (typeof detail === 'string') {
      errorMessage = detail;
    }
    // Если detail - это объект с msg
    else if (detail.msg) {
      errorMessage = detail.msg;
    }
    // Иначе преобразуем в строку
    else {
      errorMessage = String(detail);
    }
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  throw new Error(`${defaultMessage}: ${errorMessage}`);
}

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
  } catch (error: any) {
    handleApiError(error, 'Не удалось создать мероприятие');
  }
}

// Обновляет существующее мероприятие
export async function updateEventApi(id: number, eventData: Partial<IEventDetail>): Promise<boolean> {
  try {
    const response = await api.patch(`/events/${id}`, eventData);
    return response.data.ok;
  } catch (error: any) {
    handleApiError(error, 'Не удалось обновить мероприятие');
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

// ===== УПРАВЛЕНИЕ АКТИВНОСТЯМИ =====

// Добавляет активность к мероприятию
export async function addActivityApi(eventId: number, activityData: Partial<Activity>): Promise<number> {
  try {
    const response = await api.post(`/events/${eventId}/activities`, activityData);
    if (response.data.ok) {
      return response.data.activity_id;
    }
    throw new Error('Ошибка добавления активности');
  } catch (error: any) {
    handleApiError(error, 'Не удалось добавить активность');
  }
}

// Обновляет существующую активность
export async function updateActivityApi(activityId: number, activityData: Partial<Activity>): Promise<boolean> {
  try {
    const response = await api.patch(`/activities/${activityId}`, activityData);
    return response.data.ok;
  } catch (error: any) {
    handleApiError(error, 'Не удалось обновить активность');
  }
}

// Удаляет активность
export async function deleteActivityApi(activityId: number): Promise<boolean> {
  try {
    const response = await api.delete(`/activities/${activityId}`);
    return response.data.ok;
  } catch (error: any) {
    handleApiError(error, 'Не удалось удалить активность');
  }
}