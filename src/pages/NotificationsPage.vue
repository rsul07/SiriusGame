<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)
const router = useRouter()
</script>

<template>
  <div class="p-4">
    <div class="flex items-center mb-6">
      <button @click="router.back()" class="p-2 mr-2 -ml-2 rounded-full hover:bg-gray-200 transition-colors">
        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      <h1 class="text-2xl font-bold">Все уведомления</h1>
    </div>
    <ul v-if="notifications.length > 0" class="space-y-3">
      <li 
        v-for="notification in notifications" 
        :key="notification.id"
        class="p-4 bg-white rounded-lg shadow-sm"
      >
        <p class="text-sm text-gray-800">{{ notification.message }}</p>
        <p class="text-xs text-gray-500 mt-2">{{ notification.timestamp }}</p>
      </li>
    </ul>
    <div v-else class="text-center text-gray-500 py-10">
      Уведомлений нет.
    </div>
  </div>
</template>