<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useEventStore, type IEvent } from '@/stores/events';
import Modal from '@/components/Modal.vue';

const eventStore = useEventStore();

const selectedEvent = ref<IEvent | null>(null);
const form = reactive<{ data: Partial<IEvent> | null }>({ data: null });
const activeTab = ref<'events' | 'users'>('events');
const isCreatingNew = ref(false);

const showBlockConfirm = ref(false);
const userToBlock = ref<{ id: string, fullName: string } | null>(null);

const users = ref([
  { id: '1', fullName: 'Администратор', email: 'admin@example.com', role: 'admin' },
  { id: '2', fullName: 'Организатор Мероприятий', email: 'organizer@example.com', role: 'organizer' },
  { id: '3', fullName: 'Судья Соревнований', email: 'judge@example.com', role: 'judge' },
  { id: '12345', fullName: 'Иван Петров', email: 'ivan@example.com', role: 'user' },
  { id: '67890', fullName: 'Мария Сидорова', email: 'maria@example.com', role: 'user' },
]);

const futureEvents = computed(() => eventStore.events.filter(e => e.state === 'future'));
const currentEvents = computed(() => eventStore.events.filter(e => e.state === 'current'));

const selectEventForEditing = (event: IEvent) => {
  form.data = JSON.parse(JSON.stringify(event));
  isCreatingNew.value = false;
  selectedEvent.value = event;
};

const createNewEvent = () => {
  form.data = {
    title: 'Новое мероприятие от Админа',
    imgUrls: [],
    date: new Date().toISOString().split('T')[0],
    state: 'future',
    description: '',
    activities: [],
    leaderboard: [],
  };
  isCreatingNew.value = true;
  selectedEvent.value = form.data as IEvent;
};

const backToSelection = () => {
  selectedEvent.value = null;
  form.data = null;
  isCreatingNew.value = false;
};

const addActivity = () => {
  if (!form.data) return;
  if (!form.data.activities) form.data.activities = [];
  form.data.activities.push({ icon: '🎉', name: 'Новое событие', color: 'bg-gray-100' });
};

const removeActivity = (index: number) => {
  form.data?.activities?.splice(index, 1);
};

const addTeam = () => {
  if (!form.data) return;
  if (!form.data.leaderboard) form.data.leaderboard = [];
  form.data.leaderboard.push({ id: Date.now(), name: 'Новая команда', score: 0, avatarUrl: '' });
};

const removeTeam = (index: number) => {
  form.data?.leaderboard?.splice(index, 1);
};

const saveEvent = () => {
  if (isCreatingNew.value) {
    alert('Мероприятие создано (симуляция)');
  } else {
    alert('Мероприятие сохранено (симуляция)');
  }
  backToSelection();
}

const promptBlockUser = (user: { id: string, fullName: string }) => {
  userToBlock.value = user;
  showBlockConfirm.value = true;
}

const confirmBlockUser = () => {
  if (!userToBlock.value) return;
  alert(`Пользователь ${userToBlock.value.fullName} заблокирован (симуляция).`);
  showBlockConfirm.value = false;
  userToBlock.value = null;
}

onMounted(() => {
  eventStore.fetchEvents();
});
</script>

<template>
  <div class="p-4 md:p-6">
    <h1 class="text-3xl font-bold mb-6">Панель Администратора</h1>
    <div class="mb-6 border-b flex">
      <button @click="activeTab = 'events'" :class="['py-2 px-4', activeTab === 'events' ? 'border-b-2 border-primary text-primary' : 'text-gray-500']">Мероприятия</button>
      <button @click="activeTab = 'users'" :class="['py-2 px-4', activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-gray-500']">Пользователи</button>
    </div>

    <div v-if="activeTab === 'events'">
      <div v-if="!selectedEvent">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Выберите мероприятие</h2>
          <button @click="createNewEvent" class="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">+ Создать новое</button>
        </div>
        <div class="space-y-6">
          <div>
            <h3 class="font-bold text-gray-600 mb-2">Будущие</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="event in futureEvents" :key="event.id" class="bg-white rounded-lg shadow-md flex flex-col">
                <div class="p-4 flex-grow">
                  <img :src="event.imgUrls[0]" class="w-full h-32 object-cover rounded-md mb-3">
                  <h4 class="font-bold truncate">{{ event.title }}</h4>
                  <p class="text-sm text-gray-500">{{ event.date }}</p>
                </div>
                <button @click="selectEventForEditing(event)" class="w-full mt-auto px-4 py-2 text-sm bg-primary text-white rounded-b-lg hover:opacity-90">Редактировать</button>
              </div>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-gray-600 mb-2">Текущие</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="event in currentEvents" :key="event.id" class="bg-white rounded-lg shadow-md flex flex-col">
                <div class="p-4 flex-grow">
                  <img :src="event.imgUrls[0]" class="w-full h-32 object-cover rounded-md mb-3">
                  <h4 class="font-bold truncate">{{ event.title }}</h4>
                  <p class="text-sm text-gray-500">{{ event.date }}</p>
                </div>
                <button @click="selectEventForEditing(event)" class="w-full mt-auto px-4 py-2 text-sm bg-primary text-white rounded-b-lg hover:opacity-90">Редактировать</button>
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
              <div><label class="block text-sm font-medium text-gray-700">Статус</label><select v-model="form.data.state" class="mt-1 w-full p-2 border rounded-md bg-white"><option value="future">Будущее</option><option value="current">Текущее</option><option value="past">Прошедшее</option></select></div>
            </div>
            <div><label class="block text-sm font-medium text-gray-700">Описание</label><textarea v-model="form.data.description" rows="4" class="mt-1 w-full p-2 border rounded-md"></textarea></div>
            <div class="grid md:grid-cols-2 gap-6">
              <div><label class="block text-sm font-medium text-gray-700">URL изображений (каждый с новой строки)</label><textarea :value="form.data.imgUrls?.join('\n')" @input="form.data.imgUrls = ($event.target as HTMLTextAreaElement).value.split('\n')" rows="3" class="mt-1 w-full p-2 border rounded-md"></textarea></div>
              <!-- <div><label class="block text-sm font-medium text-gray-700">URL карты (Yandex, Google)</label><input v-model="form.data.mapUrl" type="text" class="mt-1 w-full p-2 border rounded-md"></div> -->
            </div>
            <div>
              <h3 class="font-medium mb-2">События (Activities)</h3>
              <div v-for="(activity, index) in form.data.activities" :key="index" class="flex items-center gap-2 p-2 mb-2 bg-gray-50 rounded"><input type="text" v-model="activity.icon" class="w-10 text-center p-1 bg-white border rounded"><input type="text" v-model="activity.name" class="flex-1 p-1 bg-white border rounded"><button @click="removeActivity(index)" type="button" class="text-red-500 hover:text-red-700">✕</button></div>
              <button @click="addActivity" type="button" class="text-sm text-primary hover:underline">+ Добавить событие</button>
            </div>
            <div>
              <h3 class="font-medium mb-2">Команды и Очки</h3>
              <div v-for="(team, index) in form.data.leaderboard" :key="index" class="flex items-center gap-2 p-2 mb-2 bg-gray-50 rounded"><input type="text" v-model="team.name" class="flex-1 p-1 bg-white border rounded"><input type="number" v-model="team.score" class="w-24 p-1 border rounded-md"><button @click="removeTeam(index)" type="button" class="text-red-500 hover:text-red-700">✕</button></div>
              <button @click="addTeam" type="button" class="text-sm text-primary hover:underline">+ Добавить команду</button>
            </div>
            <div class="flex flex-col md:flex-row gap-4 pt-4 border-t">
              <button type="submit" class="flex-1 px-4 py-2 text-white bg-primary rounded-md hover:opacity-90">Сохранить</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'users'">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Список пользователей</h2>
        <input type="text" placeholder="Поиск по ID, имени или email..." class="w-full p-2 border rounded-md mb-4">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50 text-xs text-gray-700 uppercase"><tr><th class="p-3">ID</th><th class="p-3">ФИО</th><th class="p-3">Email</th><th class="p-3">Роль</th><th class="p-3">Действия</th></tr></thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="border-b">
                <td class="p-3 font-mono text-xs">{{ user.id }}</td><td class="p-3 font-medium">{{ user.fullName }}</td><td class="p-3">{{ user.email }}</td>
                <td class="p-3"><select :value="user.role" class="p-1 border rounded-md bg-white text-sm"><option value="user">Пользователь</option><option value="judge">Судья</option><option value="organizer">Организатор</option><option value="admin">Администратор</option></select></td>
                <td class="p-3"><button @click="promptBlockUser(user)" class="text-red-500 hover:text-red-700 text-sm">Заблокировать</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <Modal :show="showBlockConfirm" @close="showBlockConfirm = false">
      <div v-if="userToBlock" class="p-6">
        <h3 class="text-lg font-bold">Подтверждение блокировки</h3>
        <p class="my-4 text-gray-700">Вы уверены, что хотите заблокировать пользователя <strong class="text-gray-900">{{ userToBlock.fullName }}</strong> (ID: {{ userToBlock.id }})?</p>
        <div class="flex justify-end gap-4 mt-6">
          <button @click="showBlockConfirm = false" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Отмена</button>
          <button @click="confirmBlockUser" class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Да, заблокировать</button>
        </div>
      </div>
    </Modal>
  </div>
</template>