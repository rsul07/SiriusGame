<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useEventStore } from '@/stores/events'
import { useNotificationStore } from '@/stores/notifications'
import { storeToRefs } from 'pinia'
import EventCardCurrent from '@/components/EventCardCurrent.vue'
import NotificationDropdown from '@/components/NotificationDropdown.vue'
import { onClickOutside } from '@vueuse/core'
import EmptyState from '@/components/EmptyState.vue'

const eventStore = useEventStore()
const notificationStore = useNotificationStore()
const { events, isLoading } = storeToRefs(eventStore)
const { unreadCount } = storeToRefs(notificationStore)

const showNotifications = ref(false)
const notificationArea = ref(null)

const currentEvents = computed(() => {
  return events.value.filter(e => e.state === 'current')
})

onClickOutside(notificationArea, () => {
  showNotifications.value = false
})

onMounted(() => {
  eventStore.fetchEvents()
})
</script>

<template>
  <div class="p-4">
    <div class="fixed top-0 left-0 right-0 z-20 h-16 flex items-center justify-end px-4">
      <div ref="notificationArea" class="relative">
        <button @click="showNotifications = !showNotifications" class="p-2 rounded-full hover:bg-gray-200/50 transition-colors">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          <span v-if="unreadCount > 0" class="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-bgMain"></span>
        </button>
        <Transition name="fade">
          <NotificationDropdown v-if="showNotifications" />
        </Transition>
      </div>
    </div>

    <!-- Общая обертка для центрирования всего контента на больших экранах -->
    <div class="max-w-7xl mx-auto">
      <div class="pt-16">
        <div class="flex flex-col items-center justify-center my-8">
          <img src="@/assets/sirius.png" alt="App Logo" class="w-24 h-24 mb-4">
          <h1 class="text-3xl font-bold text-gray-800">Добро пожаловать!</h1>
          <p class="text-gray-600 mt-2">Актуальные мероприятия прямо сейчас</p>
        </div>

        <div v-if="isLoading" class="text-center text-gray-500">Загрузка...</div>
        <div v-else>
          <h2 class="text-xl font-bold mb-4 px-2">Текущие мероприятия</h2>
          <div v-if="currentEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <EventCardCurrent v-for="event in currentEvents" :key="event.id" :event="event" />
          </div>
          <EmptyState v-else
            title="Нет активных мероприятий"
            message="В данный момент нет идущих соревнований. Загляните на вкладку 'Мероприятия', чтобы увидеть будущие!"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>