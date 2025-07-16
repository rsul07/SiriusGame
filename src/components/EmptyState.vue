<script setup lang="ts">
import EmptyBoxIcon from '@/assets/empty-box.svg'; // Импортируем SVG как компонент

defineProps<{
  title: string;
  message: string;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg shadow-sm">
    <EmptyBoxIcon class="w-24 h-24 mb-4 text-gray-300" />
    <h3 class="text-xl font-bold text-gray-800">{{ title }}</h3>
    <p class="mt-2 text-gray-500 max-w-xs">{{ message }}</p>
  </div>
</template>