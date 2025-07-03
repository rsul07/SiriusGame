<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import BottomNavbar from '@/components/BottomNavbar.vue'

const route = useRoute()
const transitionName = ref('slide-fade')

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

    if (toOrder !== undefined && fromOrder !== undefined) {
      transitionName.value = toOrder > fromOrder ? 'slide-left' : 'slide-right'
    } else {
      transitionName.value = 'fade-only'
    }
  }
)
</script>

<template>
  <div class="flex flex-col h-screen bg-bgMain">
    <!-- Main теперь просто контейнер для позиционирования -->
    <main class="flex-1 relative overflow-hidden">
      <RouterView v-slot="{ Component, route }">
        <Transition :name="transitionName" mode="out-in">
          <!-- 
            КЛЮЧЕВОЕ ИЗМЕНЕНИЕ:
            Скролл и padding теперь здесь, ВНУТРИ анимированного блока.
            pb-16 (padding-bottom: 4rem) компенсирует высоту BottomNavbar.
          -->
          <div :key="route.name" class="absolute w-full h-full overflow-y-auto pb-16">
            <component :is="Component" />
          </div>
        </Transition>
      </RouterView>
    </main>
    
    <BottomNavbar />
  </div>
</template>

<style>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active,
.fade-only-enter-active,
.fade-only-leave-active {
  transition: all 0.25s ease-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

.fade-only-enter-from,
.fade-only-leave-to {
  opacity: 0;
}
.fade-only-enter-to,
.fade-only-leave-from {
  opacity: 1;
}
</style>