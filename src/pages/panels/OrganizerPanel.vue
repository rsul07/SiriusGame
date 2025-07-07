<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useEventStore, type IEvent } from '@/stores/events';
import EventCard from '@/components/EventCard.vue';

const eventStore = useEventStore();

const selectedEvent = ref<IEvent | null>(null);
const form = reactive<{ data: Partial<IEvent> | null }>({ data: null });
const isCreatingNew = ref(false);

const futureEvents = computed(() => eventStore.events.filter(e => e.state === 'future'));
const currentEvents = computed(() => eventStore.events.filter(e => e.state === 'current'));

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
        <div>
          <h3 class="font-bold text-gray-600 mb-2">Будущие</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="event in futureEvents" :key="event.id" class="flex flex-col">
              <EventCard :event="event" class="flex-grow"/>
              <button @click="selectEventForEditing(event)" class="w-full mt-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">Редактировать</button>
            </div>
          </div>
        </div>
        <div>
          <h3 class="font-bold text-gray-600 mb-2">Текущие</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="event in currentEvents" :key="event.id" class="flex flex-col">
              <EventCard :event="event" class="flex-grow"/>
              <button @click="selectEventForEditing(event)" class="w-full mt-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">Редактировать</button>
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
          <div><label class="block text-sm font-medium text-gray-700">Название</label><input v-model="form.data.title" type="text" class="mt-1 w-full p-2 border rounded-md"></div>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div><label class="block text-sm font-medium text-gray-700">Дата проведения</label><input v-model="form.data.date" type="text" class="mt-1 w-full p-2 border rounded-md"></div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Статус</label>
              <select v-model="form.data.state" class="mt-1 w-full p-2 border rounded-md bg-white">
                <option value="future">Будущее</option>
                <option value="current">Текущее</option>
                <option value="past">Прошедшее</option>
              </select>
            </div>
          </div>
          
          <div><label class="block text-sm font-medium text-gray-700">Описание</label><textarea v-model="form.data.description" rows="4" class="mt-1 w-full p-2 border rounded-md"></textarea></div>

          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">URL изображений (каждый с новой строки)</label>
              <textarea 
                :value="form.data?.media?.map(m => m.url).join('\n') || ''" 
                rows="3" class="mt-1 w-full p-2 border rounded-md">
                <!-- @input="form.data?.media = ($event.target as HTMLTextAreaElement).value.split('\n')"  -->
              </textarea>
            </div>
            <!-- <div><label class="block text-sm font-medium text-gray-700">URL карты (Yandex, Google)</label><input v-model="form.data.mapUrl" type="text" class="mt-1 w-full p-2 border rounded-md"></div> -->
          </div>
          <!-- <div>
            <h3 class="font-medium mb-2">События (Activities)</h3>
            <div v-for="(activity, index) in form.data.activities" :key="index" class="flex items-center gap-2 p-2 mb-2 bg-gray-50 rounded"><input type="text" v-model="activity.icon" class="w-10 text-center p-1 bg-white border rounded"><input type="text" v-model="activity.name" class="flex-1 p-1 bg-white border rounded"><button @click="removeActivity(index)" type="button" class="text-red-500 hover:text-red-700">✕</button></div>
            <button @click="addActivity" type="button" class="text-sm text-primary hover:underline">+ Добавить событие</button>
          </div>
          <div>
            <h3 class="font-medium mb-2">Команды и Очки</h3>
            <div v-for="(team, index) in form.data.leaderboard" :key="index" class="flex items-center gap-2 p-2 mb-2 bg-gray-50 rounded"><input type="text" v-model="team.name" class="flex-1 p-1 bg-white border rounded"><input type="number" v-model="team.score" class="w-24 p-1 border rounded-md"><button @click="removeTeam(index)" type="button" class="text-red-500 hover:text-red-700">✕</button></div>
            <button @click="addTeam" type="button" class="text-sm text-primary hover:underline">+ Добавить команду</button>
          </div> -->
          <div class="flex flex-col md:flex-row gap-4 pt-4 border-t">
            <button type="submit" class="flex-1 px-4 py-2 text-white bg-primary rounded-md hover:opacity-90">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template> 