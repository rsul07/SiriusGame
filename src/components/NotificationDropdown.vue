<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'

const notificationStore = useNotificationStore()
const { notifications, unreadCount } = storeToRefs(notificationStore)
</script>

<template>
  <div class="absolute top-14 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
    <div class="p-4">
      <div class="flex justify-between items-center">
        <h3 class="font-bold text-gray-800">Уведомления</h3>
        <button 
          v-if="unreadCount > 0"
          @click="notificationStore.markAllAsRead()" 
          class="text-xs text-primary hover:underline"
        >
          Прочитать все
        </button>
      </div>
    </div>
    <ul v-if="notifications.length > 0" class="max-h-96 overflow-y-auto">
      <li 
        v-for="notification in notifications.slice(0, 3)" 
        :key="notification.id"
        class="border-t p-4 hover:bg-gray-50"
      >
        <div class="flex items-start gap-3">
          <div class="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" :class="notification.isRead ? 'bg-transparent' : 'bg-primary'"></div>
          <div class="flex-1">
            <p class="text-sm text-gray-700 leading-tight">{{ notification.message }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ notification.timestamp }}</p>
          </div>
        </div>
      </li>
    </ul>
    <div v-else class="p-8 text-center text-gray-500">
      Нет новых уведомлений
    </div>
    <div class="border-t p-2 text-center">
      <RouterLink :to="{ name: 'Notifications' }" class="text-sm font-medium text-primary hover:underline">
        Показать все
      </RouterLink>
    </div>
  </div>
</template>