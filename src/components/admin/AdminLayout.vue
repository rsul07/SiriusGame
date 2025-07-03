<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="flex h-screen bg-gray-100 font-sans">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
      <div class="p-4 text-xl font-bold border-b border-gray-700">Admin Panel</div>
      <nav class="flex-1 p-2 space-y-1">
        <RouterLink to="/admin" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">Дашборд</RouterLink>
        <RouterLink to="/admin/events" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">Мероприятия</RouterLink>
        <RouterLink to="/admin/users" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">Пользователи</RouterLink>
        <hr class="my-2 border-gray-700">
        <RouterLink to="/app/home" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">Вернуться на сайт</RouterLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="bg-white shadow-sm p-4 sticky top-0 z-10">
        <h1 class="text-xl font-semibold text-gray-800">{{ $route.meta.title || 'Админ-панель' }}</h1>
      </header>
      <div class="flex-1 overflow-y-auto p-6 md:p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Стили для активной ссылки в сайдбаре */
.router-link-exact-active {
  @apply bg-primary text-white;
}
</style>