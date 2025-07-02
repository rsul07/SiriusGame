<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useEventStore } from '@/stores/events'
import { storeToRefs } from 'pinia'
import EventCard from '@/components/EventCard.vue'

type Tab = 'future' | 'past'
const activeTab = ref<Tab>('future')

const eventStore = useEventStore()
const { events, isLoading, error } = storeToRefs(eventStore)

const futureEvents = computed(() => events.value.filter(e => e.state === 'future'))
const pastEvents = computed(() => events.value.filter(e => e.state === 'past'))

// Функция для определения стилей активной вкладки
const getTabClass = (tab: Tab) => {
  return activeTab.value === tab 
    ? 'bg-primary text-white shadow' 
    : 'text-gray-600 hover:bg-blue-100'
}

onMounted(() => {
  if (eventStore.events.length === 0) {
    eventStore.fetchEvents()
  }
})
</script>

<template>
  <div>
    <!-- Tabs -->
    <div class="sticky top-0 z-10 p-2 bg-bgMain backdrop-blur-sm bg-opacity-80">
      <div class="flex justify-center p-1 space-x-1 bg-white rounded-lg shadow-sm max-w-md mx-auto">
        <button 
          @click="activeTab = 'future'" 
          :class="['w-full px-3 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors duration-300', getTabClass('future')]"
        >
          Будущие
        </button>
        <button 
          @click="activeTab = 'past'"
          :class="['w-full px-3 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors duration-300', getTabClass('past')]"
        >
          Прошедшие
        </button>
      </div>
    </div>
    <!-- Content -->
    <div class="p-4">
      <div v-if="isLoading" class="text-center text-gray-500 pt-10">Загрузка...</div>
      <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <template v-if="activeTab === 'future'">
            <EventCard v-for="event in futureEvents" :key="event.id" :event="event"/>
          </template>
          <template v-else>
            <EventCard v-for="event in pastEvents" :key="event.id" :event="event"/>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>