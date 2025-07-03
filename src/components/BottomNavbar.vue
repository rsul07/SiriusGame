<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()

const navItemsRefs = ref<(HTMLElement | null)[]>([])
const magicIndicator = ref<HTMLElement | null>(null)

const navItems = [
  { name: 'Домой', path: '/app/home', nameMatch: 'Home', iconD: 'M10.707 2.293a1 1 0 0 0-1.414 0l-7 7a1 1 0 0 0 1.414 1.414L4 10.414V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6.586l.293.293a1 1 0 0 0 1.414-1.414l-7-7Z' },
  // Возвращаем флаг для кастомной иконки
  { name: 'Мероприятия', path: '/app/events', nameMatch: 'Events', isCustomIcon: true },
  { name: 'Профиль', path: '/app/profile', nameMatch: 'Profile', isProfile: true },
]

const updateIndicator = () => {
  if (!magicIndicator.value) return;

  const activeItemIndex = navItems.findIndex(item => {
    if (item.nameMatch === 'Events') {
      return route.name === 'Events' || route.name === 'EventDetail';
    }
    return route.name === item.nameMatch;
  });
  
  const activeElement = navItemsRefs.value[activeItemIndex];

  if (activeElement) {
    const { offsetLeft, clientWidth } = activeElement;
    magicIndicator.value.style.left = `${offsetLeft}px`;
    magicIndicator.value.style.width = `${clientWidth}px`;
    magicIndicator.value.style.opacity = '1';
  } else {
    magicIndicator.value.style.opacity = '0';
  }
}

watch(() => route.name, async () => {
  await nextTick();
  updateIndicator();
})

onMounted(() => {
  setTimeout(() => {
    updateIndicator();
  }, 50);
})
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-gray-200">
    <div class="relative grid h-full max-w-lg grid-cols-3 mx-auto">

      <!-- Плавающий элемент выделения (линия сверху) -->
      <div 
        ref="magicIndicator"
        class="absolute top-0 h-[3px] bg-primary rounded-full transition-all duration-300 ease-in-out pointer-events-none opacity-0"
      ></div>

      <!-- Элементы навигации -->
      <RouterLink
        v-for="(item, index) in navItems"
        :key="item.name"
        :to="item.path"
        :ref="el => { if (el) navItemsRefs[index] = (el as any).$el as HTMLElement }"
        class="relative z-10 inline-flex flex-col items-center justify-center px-5"
      >
        <!-- Кастомная иконка для Мероприятий -->
        <svg v-if="item.isCustomIcon" class="w-6 h-6 mb-1 transition-colors duration-300" :class="route.name === 'Events' || route.name === 'EventDetail' ? 'text-primary' : 'text-gray-500'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>

        <!-- Иконка Профиля -->
        <div v-else-if="item.isProfile" class="relative mb-1">
          <img v-if="authStore.isAuthenticated" :src="authStore.userAvatar" class="w-6 h-6 rounded-full object-cover">
          <svg v-else class="w-6 h-6 transition-colors duration-300" :class="route.name === item.nameMatch ? 'text-primary' : 'text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
          </svg>
        </div>

        <!-- Обычные иконки -->
        <svg v-else class="w-6 h-6 mb-1 transition-colors duration-300" :class="{
          'text-primary': route.name === item.nameMatch,
          'text-gray-500': route.name !== item.nameMatch
        }" fill="currentColor" viewBox="0 0 20 20">
          <path :d="item.iconD"/>
        </svg>
        
        <span class="text-sm transition-colors duration-300" :class="{
          'text-primary font-semibold': (item.nameMatch === 'Events' && (route.name === 'Events' || route.name === 'EventDetail')) || route.name === item.nameMatch,
          'text-gray-500': !((item.nameMatch === 'Events' && (route.name === 'Events' || route.name === 'EventDetail')) || route.name === item.nameMatch)
        }">
          {{ item.name }}
        </span>
      </RouterLink>

    </div>
  </nav>
</template>