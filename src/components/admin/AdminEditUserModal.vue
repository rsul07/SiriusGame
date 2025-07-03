<script setup lang="ts">
import { ref, watch } from 'vue';
import type { User } from '@/stores/auth';
import Modal from '@/components/Modal.vue';

const props = defineProps<{
  show: boolean;
  user: User | null;
}>();

const emit = defineEmits(['close', 'save']);

const localUser = ref<Partial<User>>({});

watch(() => props.user, (newUser) => {
  if (newUser) {
    // Создаем глубокую копию, чтобы избежать мутации пропса
    localUser.value = JSON.parse(JSON.stringify(newUser));
  }
}, { immediate: true, deep: true });

const onSave = () => {
  emit('save', localUser.value);
};
</script>

<template>
  <Modal :show="show" @close="emit('close')">
    <div class="p-6">
      <h2 class="text-xl font-bold mb-6">Редактирование пользователя</h2>
      
      <form v-if="localUser" @submit.prevent="onSave" class="space-y-4">
        <div>
          <label for="fullName" class="block text-sm font-medium text-gray-700">ФИО</label>
          <input v-model="localUser.fullName" type="text" id="fullName" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="localUser.email" type="email" id="email" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
        </div>

        <div class="pt-2 space-y-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="localUser.is_superuser" class="h-4 w-4 rounded text-primary border-gray-300 focus:ring-primary">
            <span>Права администратора</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="localUser.is_verified" class="h-4 w-4 rounded text-primary border-gray-300 focus:ring-primary">
            <span>Email подтвержден</span>
          </label>
           <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="localUser.is_2fa_enabled" class="h-4 w-4 rounded text-primary border-gray-300 focus:ring-primary">
            <span>Двухфакторная аутентификация</span>
          </label>
        </div>

        <div class="flex justify-end gap-4 pt-4">
          <button type="button" @click="emit('close')" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors">Отмена</button>
          <button type="submit" class="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 transition-opacity">Сохранить</button>
        </div>
      </form>
    </div>
  </Modal>
</template>