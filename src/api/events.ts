import axios from 'axios'
import type { IEvent } from '@/stores/events'

const API_URL = 'http://62.183.4.195:8000'

export function mapSEventToIEvent(event: any): IEvent {
  return {
    id: event.id,
    title: event.title,
    is_team: event.is_team,
    date: event.date ? new Date(event.date).toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }) : 'Дата не указана',
    state: event.state,
    description: event.description || '',
    start_time: event.start_time,
    end_time: event.end_time,
    max_members: event.max_members,
    max_teams: event.max_teams,
    media: (event.media || []).map((m: any) => ({
      id: m.id,
      url: m.url,
      media_type: m.media_type,
      name: m.name || undefined,
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