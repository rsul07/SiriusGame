import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchEventsApi, fetchEventByIdApi } from '@/api/events'
import type { IEventCard, IEventDetail, Leader, Activity, Media } from '@/types'

// ЭКСПОРТИРУЕМ ВСЕ НУЖНЫЕ ТИПЫ
export type { Leader, Activity, Media, IEventCard, IEventDetail };

export const useEventStore = defineStore('events', () => {
  const events = ref<IEventCard[]>([])
  const detailedEvents = ref<Record<number, IEventDetail>>({})
  const isLoadingList = ref(false)
  const isLoadingDetail = ref(false)
  const error = ref<string | null>(null)

  const getEventById = (id: number) => {
    return detailedEvents.value[id] || events.value.find(event => event.id === id)
  }

  async function fetchEvents(force = false) {
    if (events.value.length > 0 && !force) return
    isLoadingList.value = true
    error.value = null
    try {
      events.value = await fetchEventsApi()
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoadingList.value = false
    }
  }

   async function fetchEventById(id: number, force = false): Promise<IEventDetail | undefined> {
    if (detailedEvents.value[id] && !force) return detailedEvents.value[id];
    isLoadingDetail.value = true
    error.value = null
    try {
      const data = await fetchEventByIdApi(id);
      
      // --- ДОБАВЛЯЕМ МОК-ДАННЫЕ ДЛЯ ТЕСТА ---
      if (data.id === 3) {
        data.activities = [
          { id: 101, name: 'Финальная гонка роботов, которая определит победителя', icon: '🏁', is_scoreable: true, is_versus: true, max_score: 100, start_dt: '2024-07-25T14:00:00Z', end_dt: '2024-07-25T15:00:00Z' },
          { id: 102, name: 'Тех-питстоп и ремонт', icon: '🛠️', is_scoreable: true, is_versus: false, max_score: 50, start_dt: '2024-07-25T15:00:00Z', end_dt: '2024-07-25T16:00:00Z' },
          { id: 103, name: 'Спич от главного спонсора мероприятия', icon: '🎤', is_scoreable: false, is_versus: false, start_dt: '2024-07-25T16:30:00Z', end_dt: null },
          { id: 104, name: 'Церемония награждения', icon: '🏆', is_scoreable: false, is_versus: false, start_dt: '2024-07-25T17:00:00Z', end_dt: '2024-07-25T17:30:00Z' },
        ]
      }
      // --- КОНЕЦ МОК-ДАННЫХ ---
      
      detailedEvents.value[id] = data;
      return data;
    } catch (err: any) {
      error.value = err.message
      return undefined
    } finally {
      isLoadingDetail.value = false
    }
  }

  return { events, isLoading: isLoadingList, isLoadingDetail, error, getEventById, fetchEvents, fetchEventById }
})