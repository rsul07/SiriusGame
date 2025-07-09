import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchEventsApi } from '@/api/events'

// Интерфейсы вынесены для ясности
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
  // Раскомментируем, чтобы TS не ругался в других компонентах
  leaderboard?: Leader[]
  activities?: Activity[]
}

export const useEventStore = defineStore('events', () => {
  const events = ref<IEvent[]>([])
  const isLoading = ref(false)
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
      
      // --- ВРЕМЕННЫЙ БЛОК ДЛЯ ДЕМОНСТРАЦИИ ---
      // Добавляем мок-данные к данным из API, чтобы было что отображать.
      // Когда ваш API будет возвращать leaderboard и activities, этот блок можно убрать.
      if (events.value.length > 0) {
        events.value[0].leaderboard = [
            { id: 1, name: 'Елена Васильева', score: 100, avatarUrl: 'https://i.pravatar.cc/150?u=1' },
            { id: 2, name: 'Иван Грозный', score: 95, avatarUrl: 'https://i.pravatar.cc/150?u=2' },
            { id: 3, name: 'Мария Кузнецова', score: 92, avatarUrl: 'https://i.pravatar.cc/150?u=3' },
            { id: 8, name: 'Алексей Петров', score: 88, avatarUrl: 'https://i.pravatar.cc/150?u=8' },
        ];
        events.value[0].activities = [
            { icon: '🏁', name: 'Финальная гонка', color: 'bg-red-100' },
            { icon: '🛠️', name: 'Тех-питстоп', color: 'bg-blue-100' },
        ];
      }
      // --- КОНЕЦ ВРЕМЕННОГО БЛОКА ---

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