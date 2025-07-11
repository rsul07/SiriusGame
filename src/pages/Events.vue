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

const getTabClass = (tab: Tab) => {
  return activeTab.value === tab 
    ? 'bg-primary text-white shadow' 
    : 'text-gray-600 hover:bg-blue-100'
}

onMounted(async () => {
  await eventStore.fetchEvents()
})
</script>

<template>
  <div>
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

    <div class="p-4">
      <div v-if="isLoading && events.length === 0" class="text-center text-gray-500 pt-10">Загрузка...</div>
      <div v-else-if="error" class="text-center text-red-500 pt-10">{{ error }}</div>
      <div v-else>
        <Transition name="fade" mode="out-in">
          <div v-if="activeTab === 'future'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <EventCard v-for="event in futureEvents" :key="event.id" :event="event"/>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <EventCard v-for="event in pastEvents" :key="event.id" :event="event"/>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>