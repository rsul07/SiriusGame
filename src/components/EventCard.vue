<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { IEvent } from '@/stores/events'

const props = defineProps<{ event: IEvent }>()

const badge = computed(() => {
  switch (props.event.state) {
    case 'past':
      return { text: 'Завершено', class: 'bg-gray-200 text-gray-800' }
    case 'current':
      return { text: 'Идёт сейчас', class: 'bg-red-500 text-white animate-pulse' }
    case 'future':
      return props.event.type === 'team'
        ? { text: 'Командное', class: 'bg-indigo-100 text-indigo-800' }
        : { text: 'Личное', class: 'bg-green-100 text-green-800' }
    default:
      return { text: '', class: '' }
  }
})
</script>

<template>
  <RouterLink 
    :to="{ name: 'EventDetail', params: { id: event.id } }" 
    class="group flex flex-row md:flex-col bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
  >
    <!-- Изображение -->
    <div class="w-1/3 md:w-full flex-shrink-0">
      <img :src="event.imgUrls[0]" :alt="event.title" class="w-full h-full md:h-32 object-cover">
    </div>

    <!-- Контент -->
    <div class="p-4 flex flex-col justify-between flex-1">
      <div>
        <h3 class="font-bold text-gray-800 text-base leading-tight md:truncate">{{ event.title }}</h3>
        <div class="flex justify-between items-center mt-2 text-sm">
          <p class="text-gray-500">{{ event.date }}</p>
          <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="badge.class">
            {{ badge.text }}
          </span>
        </div>
      </div>
      
      <!-- Активности для текущих событий -->
      <div v-if="event.state === 'current' && event.activities" class="mt-3 border-t pt-3">
        <ul class="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
          <li v-for="activity in event.activities.slice(0, 2)" :key="activity.name" class="flex items-center gap-2 text-sm">
            <span :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0', activity.color]">{{ activity.icon }}</span>
            <span class="text-gray-700 truncate">{{ activity.name }}</span>
          </li>
        </ul>
      </div>
    </div>
  </RouterLink>
</template>