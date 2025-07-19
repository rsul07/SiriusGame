<script setup lang="ts">
import type { Leader } from '@/stores/leaderboard'
import { resolveAvatarUrl } from '@/utils/resolve_avatar_url'

defineProps<{
  leaders: Leader[]
}>()
</script>

<template>
  <div class="flex items-end justify-center gap-4 text-center">
    <!-- 1 место -->
    <div v-if="leaders[0]" class="order-1 flex flex-col items-center">
      <div class="relative">
        <img :src="resolveAvatarUrl(leaders[0].avatarUrl, leaders[0].is_team)" alt="1st place" class="w-24 h-24 rounded-full border-4 border-yellow-400 object-cover bg-gray-200">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl">👑</div>
      </div>
      <h3 class="mt-2 font-semibold truncate w-28">{{ leaders[0].name }}</h3>
      <p class="text-sm text-gray-600">{{ leaders[0].score }}</p>
      <div class="w-28 h-32 bg-yellow-400 rounded-t-lg flex items-center justify-center text-5xl font-bold text-white">1</div>
    </div>

    <!-- 2 место -->
    <div v-if="leaders[1]" class="order-2 flex flex-col items-center">
      <img :src="resolveAvatarUrl(leaders[1].avatarUrl, leaders[1].is_team)" alt="2nd place" class="w-20 h-20 rounded-full border-4 border-gray-300 object-cover bg-gray-200">
      <h3 class="mt-2 font-semibold truncate w-24">{{ leaders[1].name }}</h3>
      <p class="text-sm text-gray-600">{{ leaders[1].score }}</p>
      <div class="w-24 h-24 bg-gray-300 rounded-t-lg flex items-center justify-center text-4xl font-bold text-white">2</div>
    </div>

    <!-- 3 место -->
    <div v-if="leaders[2]" class="order-3 flex flex-col items-center">
      <img :src="resolveAvatarUrl(leaders[2].avatarUrl, leaders[2].is_team)" alt="3rd place" class="w-16 h-16 rounded-full border-4 border-yellow-600 object-cover bg-gray-200">
      <h3 class="mt-2 font-semibold truncate w-20">{{ leaders[2].name }}</h3>
      <p class="text-sm text-gray-600">{{ leaders[2].score }}</p>
      <div class="w-20 h-20 bg-yellow-700 rounded-t-lg flex items-center justify-center text-3xl font-bold text-white">3</div>
    </div>
  </div>
</template>