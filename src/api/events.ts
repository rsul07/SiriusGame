import axios from 'axios';
import type { IEvent } from '@/stores/events';

const API_URL = 'http://62.183.4.195:8000';

export function mapSEventToIEvent(event: any): IEvent {
    return {
        id: event.id,
        title: event.name,
        type: event.type,
        date: new Date(event.date).toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        state: event.state,
        description: event.description,
        imgUrls: Array.isArray(event.images)
          ? event.images.map((img: any) => img.url)
          : [],
    };
}

export async function fetchEventsApi(): Promise<IEvent[]> {
  const response = await axios.get(`${API_URL}/events`);
  return response.data.map(mapSEventToIEvent);
}