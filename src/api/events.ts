import axios from 'axios'
import type { IEventCard, IEventDetail } from '@/types'

const API_URL = 'http://62.183.4.195:8000'

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
    const response = await axios.get(`${API_URL}/events`)
    return response.data.map(mapEventData) // Просто маппим, TypeScript сам возьмет нужные поля
  } catch (error) {
    throw new Error('Не удалось загрузить список мероприятий');
  }
}

// Возвращает одно "тяжелое" событие
export async function fetchEventByIdApi(id: number): Promise<IEventDetail> {
    try {
      const response = await axios.get(`${API_URL}/events/${id}`);
      return mapEventData(response.data);
    } catch (error) {
      throw new Error('Не удалось загрузить данные мероприятия');
    }
}