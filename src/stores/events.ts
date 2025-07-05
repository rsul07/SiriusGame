import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchEventsApi } from '@/api/events'

interface Media {
  id: number
  url: string
  media_type: 'image' | 'document'
  name?: string
  order: number
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
  media: Media[]

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

  const getEventById = computed(() => (id: number) => 
    events.value.find(event => event.id === id))

  async function fetchEvents(force = false) {
    if (events.value.length > 0 && !force) return
    
    isLoading.value = true
    error.value = null
    
    try {
      events.value = await fetchEventsApi()
    } catch (err: any) {
      error.value = err.message || 'Не удалось загрузить мероприятия'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    events.value = []
    error.value = null
  }

  return { 
    events,
    isLoading,
    error,
    getEventById,
    fetchEvents,
    reset
  }
})