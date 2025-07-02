<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useEventStore } from '@/stores/events'
import { storeToRefs } from 'pinia'
import EventCardCurrent from '@/components/EventCardCurrent.vue'

const eventStore = useEventStore()
const { events, isLoading } = storeToRefs(eventStore)

const currentEvents = computed(() => {
  return events.value.filter(e => e.state === 'current')
})

onMounted(() => {
  eventStore.fetchEvents()
})
</script>

<template>
  <div class="p-4">
    <div class="flex flex-col items-center justify-center my-8">
      <img src="@/assets/sirius.png" alt="App Logo" class="w-24 h-24 mb-4">
      <h1 class="text-3xl font-bold text-gray-800">Добро пожаловать!</h1>
      <p class="text-gray-600 mt-2">Актуальные мероприятия прямо сейчас</p>
    </div>

    <div v-if="isLoading" class="text-center text-gray-500">Загрузка...</div>
    <div v-else class="max-w-7xl mx-auto">
      <h2 class="text-xl font-bold mb-4 px-2">Текущие мероприятия</h2>
      <div v-if="currentEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <EventCardCurrent v-for="event in currentEvents" :key="event.id" :event="event" />
      </div>
      <p v-else class="text-center text-gray-500 bg-white p-6 rounded-lg shadow-sm">
        Сейчас нет активных мероприятий. Загляните в раздел "Мероприятия", чтобы увидеть будущие!
      </p>
    </div>
  </div>
</template>