<script setup lang="ts">
import Modal from '@/components/Modal.vue';

const props = defineProps<{
  show: boolean;
  type: 'success' | 'error' | 'confirm';
  title: string;
  message: string;
}>()

const emit = defineEmits(['close', 'confirm']);
</script>

<template>
  <Modal :show="props.show" @close="emit('close')">
    <div class="p-6 text-center">
      <!-- Иконка -->
      <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
           :class="{
             'bg-green-100 text-green-600': props.type === 'success',
             'bg-red-100 text-red-600': props.type === 'error',
             'bg-yellow-100 text-yellow-600': props.type === 'confirm'
           }">
        <svg v-if="props.type === 'success'" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <svg v-if="props.type === 'error'" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <svg v-if="props.type === 'confirm'" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      </div>

      <!-- Текст -->
      <h3 class="text-xl font-bold mb-2">{{ props.title }}</h3>
      <p class="text-gray-600">{{ props.message }}</p>

      <!-- Кнопки -->
      <div class="mt-6 flex justify-center gap-4">
        <button v-if="props.type === 'confirm'" @click="emit('close')" class="px-6 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Отмена</button>
        <button v-if="props.type === 'confirm'" @click="emit('confirm')" class="px-6 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Удалить</button>
        <button v-if="props.type !== 'confirm'" @click="emit('close')" class="w-full px-6 py-2 rounded-md bg-primary text-white hover:opacity-90">ОК</button>
      </div>
    </div>
  </Modal>
</template>