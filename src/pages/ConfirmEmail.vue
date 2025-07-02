<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center p-4 h-full">
    <div class="bg-white p-10 rounded-lg shadow-md max-w-md">
      <div class="text-green-500 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <h1 class="text-2xl font-bold mb-2">Подтвердите ваш Email</h1>
      <p class="text-gray-600">Мы отправили письмо с ссылкой для подтверждения на вашу почту. Пожалуйста, перейдите по ней, чтобы завершить регистрацию.</p>
      <RouterLink :to="{ name: 'Profile' }" class="inline-block mt-6 px-6 py-2 text-white bg-primary rounded-md hover:bg-blue-700 transition-colors">
        Перейти ко входу
      </RouterLink>
    </div>
  </div>
</template>