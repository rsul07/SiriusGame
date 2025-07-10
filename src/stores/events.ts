import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchEventsApi, fetchEventByIdApi } from '@/api/events'

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

export interface Media {
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
  leaderboard?: Leader[]
  activities?: Activity[]
}

export const useEventStore = defineStore('events', () => {
  const events = ref<IEvent[]>([])
  const isLoading = ref(false)
  const isLoadingDetail = ref(false)
  const error = ref<string | null>(null)

  const getEventById = computed(() => {
    return (id: number) => events.value.find(event => event.id === id)
  })

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

  async function fetchEventById(id: number): Promise<IEvent | undefined> {
    isLoadingDetail.value = true;
    error.value = null;
    try {
      const fetchedEvent = await fetchEventByIdApi(id);
      const index = events.value.findIndex(e => e.id === id);

      if (index !== -1) {
        events.value[index] = { ...events.value[index], ...fetchedEvent };
      } else {
        events.value.push(fetchedEvent);
      }
      return events.value.find(e => e.id === id);
    } catch (err: any) {
      error.value = err.message || `Не удалось загрузить мероприятие с ID ${id}`;
      console.error(err);
      return undefined;
    } finally {
      isLoadingDetail.value = false;
    }
  }

  function reset() {
    events.value = []
    error.value = null
  }

  return { 
    events,
    isLoading,
    isLoadingDetail,
    error,
    getEventById,
    fetchEvents,
    fetchEventById,
    reset
  }
})