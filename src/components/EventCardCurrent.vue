<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import type { IEventCard } from '@/types'
import defaultImage from '@/assets/default.png'

const props = defineProps<{ 
  event: IEventCard 
}>()

// --- ГЛАВНОЕ ИСПРАВЛЕНИЕ ---
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
    <div class="relative w-full h-36 bg-gray-200">
      <img :src="imageUrl" :alt="event.title" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-0 transition-colors duration-300"></div>
    </div>
    <div class="p-4">
      <h3 class="font-bold text-gray-800 text-base truncate mb-1">{{ event.title }}</h3>
      <p class="text-sm text-gray-500 mb-3">{{ event.date }}</p>
      
      <div v-if="event.leaderboard && event.leaderboard.length > 0">
        <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">Лидеры сейчас</h4>
          <li v-for="(leader, index) in event.leaderboard.slice(0, 3)" :key="leader.id" class="flex items-center gap-3 text-sm">
            <span class="font-mono text-gray-500 w-4 text-center">{{ index + 1 }}</span>
            <img :src="leader.avatarUrl" class="w-6 h-6 rounded-full object-cover flex-shrink-0">
            <span class="font-medium text-gray-700 truncate flex-1 min-w-0">{{ leader.name }}</span>
            <span class="ml-auto font-bold text-sm text-primary">{{ leader.score }}</span>
          </li>
      </div>
    </div>
  </RouterLink>
</template>