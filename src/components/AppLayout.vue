<script setup lang="ts">
import { RouterView } from 'vue-router'
import BottomNavbar from '@/components/BottomNavbar.vue'
</script>

<template>
  <div class="flex flex-col h-screen bg-bgMain">
    <main class="flex-1 overflow-y-auto pb-16">
      <!-- 
        Отступ pb-16 равен высоте BottomNavbar,
        чтобы контент не перекрывался им.
      -->
      <RouterView />
    </main>
    
    <BottomNavbar />
  </div>
</template>