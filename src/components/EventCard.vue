<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { IEventCard } from '@/types'
import defaultImage from '@/assets/default.png'

const props = defineProps<{ 
  event: IEventCard 
}>()

const badge = computed(() => {
  if (!props.event) return { text: '', class: '' };
  switch (props.event.state) {
    case 'past': return { text: 'Завершено', class: 'bg-gray-200 text-gray-800' }
    case 'current': return { text: 'Идёт сейчас', class: 'bg-red-500 text-white animate-pulse' }
    case 'future':
      return props.event.is_team 
        ? { text: 'Командное', class: 'bg-indigo-100 text-indigo-800' }
        : { text: 'Личное', class: 'bg-green-100 text-green-800' }
    default: return { text: '', class: '' }
  }
})

const imageUrl = computed(() => {
  if (props.event?.preview_url) {
    return props.event.preview_url;
  }
  return defaultImage; 
})
</script>

<template>
  <RouterLink 
    v-if="event"
    :to="{ name: 'EventDetail', params: { id: event.id } }" 
    class="group block bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
  >
    <div class="relative w-full h-32 bg-gray-200">
      <img :src="imageUrl" :alt="event.title" class="w-full h-full object-cover">
    </div>
    <div class="p-4">
      <h3 class="font-bold text-gray-800 text-base truncate">{{ event.title }}</h3>
      <div class="flex justify-between items-center mt-2 text-sm">
        <p class="text-gray-500">{{ event.date }}</p>
        <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="badge.class">
          {{ badge.text }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>