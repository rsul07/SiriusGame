<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { IEvent } from '@/stores/events';
import Modal from '@/components/Modal.vue';

const props = defineProps<{
  show: boolean;
  event: Partial<IEvent> | null;
}>();

const emit = defineEmits(['close', 'save']);

const localEvent = ref<Partial<IEvent>>({});
const isCreating = computed(() => !props.event?.id);

watch(() => props.event, (newEvent) => {
  if (newEvent && newEvent.id) {
    const eventDate = newEvent.event_date ? new Date(newEvent.event_date).toISOString().split('T')[0] : '';
    localEvent.value = { ...newEvent, event_date: eventDate };
  } else {
    localEvent.value = {
      title: '',
      description: '',
      state: 'future',
      type: 'individual',
      event_date: new Date().toISOString().split('T')[0],
      rules: {}
    };
  }
}, { immediate: true, deep: true });

const onSave = () => {
  if (!localEvent.value.title || !localEvent.value.event_date) {
    alert('Название и дата обязательны для заполнения');
    return;
  }
  const eventData = { ...localEvent.value };
  if (eventData.event_date) {
    eventData.event_date = new Date(eventData.event_date).toISOString();
  }
  emit('save', eventData);
};
</script>

<template>
  <Modal :show="show" @close="emit('close')">
    <div class="p-6">
      <h2 class="text-xl font-bold mb-6">{{ isCreating ? 'Создание мероприятия' : 'Редактирование мероприятия' }}</h2>
      
      <form v-if="localEvent" @submit.prevent="onSave" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">Название</label>
          <input v-model="localEvent.title" type="text" id="title" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
        </div>
        
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Описание</label>
          <textarea v-model="localEvent.description" id="description" rows="4" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="state" class="block text-sm font-medium text-gray-700">Статус</label>
            <select v-model="localEvent.state" id="state" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
              <option value="future">Будущее</option>
              <option value="current">Текущее</option>
              <option value="past">Прошедшее</option>
            </select>
          </div>
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700">Тип</label>
            <select v-model="localEvent.type" id="type" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
              <option value="individual">Индивидуальное</option>
              <option value="team">Командное</option>
            </select>
          </div>
        </div>

        <div>
            <label for="date" class="block text-sm font-medium text-gray-700">Дата проведения</label>
            <input v-model="localEvent.event_date" type="date" id="date" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
        </div>

        <div class="flex justify-end gap-4 pt-4">
          <button type="button" @click="emit('close')" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors">Отмена</button>
          <button type="submit" class="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 transition-opacity">Сохранить</button>
        </div>
      </form>
    </div>
  </Modal>
</template>