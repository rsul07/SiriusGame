<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import BottomNavbar from '@/components/BottomNavbar.vue'

const route = useRoute()
const transitionName = ref('slide-fade')

// Определяем порядок наших основных вкладок
const routeOrder: { [key: string]: number } = {
  Home: 0,
  Events: 1,
  Profile: 2,
}

watch(
  () => route.name,
  (to, from) => {
    const toOrder = routeOrder[to as string]
    const fromOrder = routeOrder[from as string]

    // Если мы переходим между основными вкладками, определяем направление
    if (toOrder !== undefined && fromOrder !== undefined) {
      transitionName.value = toOrder > fromOrder ? 'slide-left' : 'slide-right'
    } else {
      // Для всех остальных переходов (например, на EventDetail) используем простую анимацию затухания
      transitionName.value = 'fade-only'
    }
  }
)
</script>

<template>
  <div class="flex flex-col h-screen bg-bgMain">
    <main class="flex-1 overflow-y-auto pb-16 relative">
      <RouterView v-slot="{ Component, route }">
        <Transition :name="transitionName" mode="out-in">
          <div :key="route.name" class="absolute w-full h-full">
            <component :is="Component" />
          </div>
        </Transition>
      </RouterView>
    </main>
    
    <BottomNavbar />
  </div>
</template>

<style>
/* 
  Стили для анимации перехода. 
  'scoped' убран, чтобы стили применялись к компонентам внутри RouterView.
*/
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active,
.fade-only-enter-active,
.fade-only-leave-active {
  transition: all 0.25s ease-out;
}

/* Движение ВЛЕВО (например, с Домой на Мероприятия) */
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

/* Движение ВПРАВО (например, с Мероприятий на Домой) */
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

/* Только затухание (для входа/выхода из карточек) */
.fade-only-enter-from,
.fade-only-leave-to {
  opacity: 0;
}
.fade-only-enter-to,
.fade-only-leave-from {
  opacity: 1;
}
</style>