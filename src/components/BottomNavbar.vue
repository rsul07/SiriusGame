<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const navItems = [
  { name: 'Домой', path: '/app/home', nameMatch: 'Home', iconD: 'M10.707 2.293a1 1 0 0 0-1.414 0l-7 7a1 1 0 0 0 1.414 1.414L4 10.414V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6.586l.293.293a1 1 0 0 0 1.414-1.414l-7-7Z' },
  { name: 'Мероприятия', path: '/app/events', nameMatch: 'Events', isCustomIcon: true },
]

const profileNavItem = computed(() => ({
  name: 'Профиль',
  path: '/app/profile',
  nameMatch: 'Profile',
}))
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-gray-200">
    <div class="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group"
        :class="{ 'text-primary': $route.name === item.nameMatch }"
      >
        <!-- Кастомная SVG иконка для Мероприятий -->
        <svg v-if="item.isCustomIcon" class="w-6 h-6 mb-1 text-gray-500 group-hover:text-primary" :class="{ '!text-primary': $route.name === item.nameMatch }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <!-- Обычная иконка для остальных -->
        <svg v-else class="w-6 h-6 mb-1 text-gray-500 group-hover:text-primary" :class="{ '!text-primary': $route.name === item.nameMatch }" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path :d="item.iconD"/>
        </svg>
        <span class="text-sm text-gray-500 group-hover:text-primary" :class="{ '!text-primary': $route.name === item.nameMatch }">{{ item.name }}</span>
      </RouterLink>

      <!-- Профиль -->
      <RouterLink
        :to="profileNavItem.path"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group"
        :class="{ 'text-primary': $route.name === profileNavItem.nameMatch }"
      >
        <div class="relative mb-1">
          <img v-if="authStore.isAuthenticated" :src="authStore.userAvatar" class="w-6 h-6 rounded-full object-cover">
          <svg v-else class="w-6 h-6 text-gray-500 group-hover:text-primary" :class="{ '!text-primary': $route.name === profileNavItem.nameMatch }" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
          </svg>
        </div>
        <span class="text-sm text-gray-500 group-hover:text-primary" :class="{ '!text-primary': $route.name === profileNavItem.nameMatch }">{{ profileNavItem.name }}</span>
      </RouterLink>
    </div>
  </nav>
</template>