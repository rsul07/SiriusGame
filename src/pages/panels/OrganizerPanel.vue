<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useEventStore, type IEvent } from '@/stores/events';
import EventCard from '@/components/EventCard.vue';

const eventStore = useEventStore();

const selectedEvent = ref<IEvent | null>(null);
const form = reactive<{ data: Partial<IEvent> | null }>({ data: null });
const isTeam = computed({
  get: () => !!form.data?.is_team,
  set: (val: boolean) => {
    if (form.data) {
      form.data.is_team = val;
      if (!val) {
        form.data.max_teams = undefined;
      }
    }
  }
});

function validateEventForm() {
  if (!form.data) return false;
  if (form.data.is_team && (!form.data.max_teams || form.data.max_teams <= 0)) {
    alert('Для командного мероприятия укажите максимальное число команд!');
    return false;
  }
  return true;
}
const isCreatingNew = ref(false);

const futureEvents = computed(() => eventStore.events.filter(e => e.state === 'future'));
const currentEvents = computed(() => eventStore.events.filter(e => e.state === 'current'));
const pastEvents = computed(() => eventStore.events.filter(e => e.state === 'past'));

const selectEventForEditing = (event: IEvent) => {
  // ИСПОЛЬЗУЕМ JSON.parse/stringify ВМЕСТО structuredClone
  // Это гарантированно создаст чистую, глубокую копию объекта данных
  form.data = JSON.parse(JSON.stringify(event));
  isCreatingNew.value = false;
  selectedEvent.value = event;
};

const createNewEvent = () => {
  form.data = {
    title: 'Новое мероприятие',
    media: [],
    date: new Date().toISOString().split('T')[0],
    state: 'future',
    description: '',
    // activities: [],
  };
  isCreatingNew.value = true;
  selectedEvent.value = form.data as IEvent;
};

const backToSelection = () => {
  selectedEvent.value = null;
  form.data = null;
  isCreatingNew.value = false;
};

// const addActivity = () => {
//   if (!form.data) return;
//   if (!form.data.activities) form.data.activities = [];
//   form.data.activities.push({ icon: '🎉', name: 'Новое событие', color: 'bg-gray-100' });
// };

// const removeActivity = (index: number) => {
//   form.data?.activities?.splice(index, 1);
// };

// const addTeam = () => {
//   if (!form.data) return;
//   if (!form.data.leaderboard) form.data.leaderboard = [];
//   form.data.leaderboard.push({ id: Date.now(), name: 'Новая команда', score: 0, avatarUrl: '' });
// };

// const removeTeam = (index: number) => {
//   form.data?.leaderboard?.splice(index, 1);
// };

const saveEvent = () => {
  if (!validateEventForm()) return;
  if (isCreatingNew.value) {
    alert('Мероприятие создано (симуляция)');
  } else {
    alert('Мероприятие сохранено (симуляция)');
  }
  backToSelection();
}

onMounted(() => {
  eventStore.fetchEvents();
});
</script>

<template>
  <div class="p-4 md:p-6">
    <h1 class="text-3xl font-bold mb-6">Панель Организатора</h1>
    
    <div v-if="!selectedEvent">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Выберите мероприятие</h2>
        <button @click="createNewEvent" class="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">+ Создать новое</button>
      </div>
      <div class="space-y-6">
        <div v-for="events in [futureEvents, currentEvents, pastEvents]" :key="events[0]?.id">
          <h3 class="font-bold text-gray-600 mb-2">{{ ['Будущие', 'Текущие', 'Прошедшие'][[futureEvents, currentEvents, pastEvents].indexOf(events)] }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="event in events" :key="event.id" class="flex flex-col">
              <EventCard :event="event" class="flex-grow"/>
              <button @click="selectEventForEditing(event)" class="w-full mt-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">Редактировать</button>
            </div>
            <div v-if="events.length === 0" class="col-span-3">
              <p class="text-gray-600 text-center">Нет таких мероприятий</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="form.data">
      <button @click="backToSelection" class="flex items-center gap-2 text-sm text-primary mb-4 hover:underline">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        Назад к выбору мероприятий
      </button>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">{{ isCreatingNew ? 'Создание нового мероприятия' : `Редактирование: "${form.data.title}"` }}</h2>
        
        <form @submit.prevent="saveEvent" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Название</label>
            <input v-model="form.data.title" type="text" class="mt-1 w-full p-2 border rounded-md">
          </div>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Дата проведения</label>
              <input v-model="form.data.date" type="text" class="mt-1 w-full p-2 border rounded-md">
            </div>
            <div>
              <!-- ...existing code... -->
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Описание</label>
            <textarea v-model="form.data.description" rows="4" class="mt-1 w-full p-2 border rounded-md"></textarea>
          </div>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">URL медиа (каждый с новой строки)</label>
              <textarea :value="form.data?.media?.map(m => m.url).join('\n') || ''" rows="3" class="mt-1 w-full p-2 border rounded-md"></textarea>
            </div>
          </div>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Командное мероприятие?</label>
              <input type="checkbox" v-model="isTeam" class="mr-2">
            </div>
            <div v-if="isTeam">
              <label class="block text-sm font-medium text-gray-700">Максимум команд</label>
              <input v-model.number="form.data.max_teams" type="number" min="1" class="mt-1 w-full p-2 border rounded-md">
            </div>
            <div v-else>
              <label class="block text-sm font-medium text-gray-400">Максимум команд (только для командных)</label>
              <input type="number" class="mt-1 w-full p-2 border rounded-md bg-gray-100" disabled>
            </div>
          </div>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Максимум участников</label>
              <input v-model.number="form.data.max_members" type="number" min="1" class="mt-1 w-full p-2 border rounded-md">
            </div>
          </div>
          <div class="flex flex-col md:flex-row gap-4 pt-4 border-t">
            <button type="submit" class="flex-1 px-4 py-2 text-white bg-primary rounded-md hover:opacity-90">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template> 