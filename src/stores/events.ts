import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchEventsApi, fetchEventByIdApi } from '@/api/events'
import type { Leader, Activity, Media, IEventCard, IEventDetail } from '@/types'
export type { Leader, Activity, Media, IEventCard, IEventDetail }

export const useEventStore = defineStore('events', () => {
  const events = ref<IEventCard[]>([])
  const detailedEvents = ref<Record<number, IEventDetail>>({})

  const isLoadingList = ref(false)
  const isLoadingDetail = ref(false)
  const error = ref<string | null>(null)

  const getEventById = (id: number): IEventDetail | IEventCard | undefined => {
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
    if (detailedEvents.value[id] && !force) { return detailedEvents.value[id]; }
    isLoadingDetail.value = true
    error.value = null
    try {
      const data = await fetchEventByIdApi(id);
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