import axios from 'axios'
import type { IEvent } from '@/stores/events'

const API_URL = 'http://62.183.4.195:8000'

export function mapSEventToIEvent(event: any): IEvent {
  const { id, title, is_team, date, state, description, start_time, end_time, max_members, max_teams, media = [] } = event;
  
  return {
    id,
    title,
    is_team,
    date: date ? new Date(date).toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }) : 'Дата не указана',
    state,
    description: description || '',
    start_time,
    end_time,
    max_members,
    max_teams,
    media: media.map((m: any) => ({
      id: m.id,
      url: m.url,
      media_type: m.media_type,
      name: m.name,
      order: m.order || 0
    }))
  }
}

export async function fetchEventsApi(): Promise<IEvent[]> {
  try {
    const response = await axios.get(`${API_URL}/events`)
    return response.data.map(mapSEventToIEvent)
  } catch (error) {
    console.error('Ошибка при загрузке событий:', error)
    return []
  }
}