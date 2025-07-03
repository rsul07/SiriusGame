<script setup lang="ts">
import { RouterView } from 'vue-router'
import BottomNavbar from '@/components/BottomNavbar.vue'
</script>

<template>
  <div class="flex flex-col h-screen bg-bgMain">
    <main class="flex-1 overflow-y-auto pb-16">
      <RouterView v-slot="{ Component, route }">
        <Transition name="slide-fade" mode="out-in">
          <div :key="route.name" class="h-full">
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
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease-out;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>