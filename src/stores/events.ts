import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchEventsApi } from '@/api/events'

export interface Leader {
  id: number
  name: string
  score: number
  avatarUrl: string
}

export interface Activity {
  icon: string
  name: string
  color: string
}

export interface IEvent {
  id: number
  title: string
  is_team: boolean
  date: string
  state: 'future' | 'current' | 'past'
  description: string
  start_time?: string
  end_time?: string
  max_members?: number
  max_teams?: number
  media: {
    id: number
    url: string
    media_type: 'image' | 'document'
    name?: string
    order: number
  }[]

  // currently not implemented
  // participants?: number
  // teams?: number
  // leaderboard?: Leader[]
  // activities?: Activity[]
}

export const useEventStore = defineStore('events', () => {
  const events = ref<IEvent[]>([])
  const isLoading = ref(false)  
  const error = ref<string | null>(null)

  async function fetchEvents() {
    if (events.value.length > 0) return
    isLoading.value = true
    error.value = null
    try {
      events.value = await fetchEventsApi()
    } catch (err: any) {
      error.value = err.message || 'Не удалось загрузить мероприятия'
    } finally {
      isLoading.value = false
    }
  }

  return { events, isLoading, error, fetchEvents }
})