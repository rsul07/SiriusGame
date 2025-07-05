<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import defaultImage from '@/assets/default.png'
import type { IEvent } from '@/stores/events'


const props = defineProps<{ 
  event: IEvent 
}>()

const images = computed(() => {
  return props.event.media.filter(m => m.media_type === 'image').map(m => m.url)
})
</script>

<template>
  <RouterLink 
    :to="{ name: 'EventDetail', params: { id: event.id } }" 
    class="group block bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
  >
    <!-- Изображение -->
    <div class="relative">
      <img :src="images[0] || defaultImage" :alt="event.title" class="w-full h-32 object-cover">
      <div class="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-0 transition-colors duration-300"></div>
    </div>

    <!-- Контент -->
    <div class="p-4">
      <h3 class="font-bold text-gray-800 text-base truncate mb-1">{{ event.title }}</h3>
      <p class="text-sm text-gray-500 mb-3">{{ event.date }}</p>
      
      <!-- Виджет лидерборда (временно отключено) -->
      <!-- <div v-if="event.leaderboard && event.leaderboard.length > 0">
        <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">Лидеры сейчас</h4>
        <ul class="space-y-2">
          <li 
            v-for="(leader, index) in event.leaderboard.slice(0, 3)" 
            :key="leader.id" 
            class="flex items-center gap-3 text-sm"
          >
            <span class="font-mono text-gray-500 w-4 text-center">{{ index + 1 }}</span>
            <img :src="leader.avatarUrl" class="w-6 h-6 rounded-full object-cover flex-shrink-0">
            <span class="font-medium text-gray-700 truncate flex-1 min-w-0">{{ leader.name }}</span>
            <span class="ml-auto font-bold text-sm text-primary">{{ leader.score }}</span>
          </li>
        </ul>
      </div>
      <p v-else class="text-sm text-gray-400 mt-4">Борьба только начинается!</p> -->
    </div>
  </RouterLink>
</template>