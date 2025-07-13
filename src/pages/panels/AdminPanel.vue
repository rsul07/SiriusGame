<!-- Временно закомментировано для билда 
 
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
-->

<template>
  <!--
  <div class="p-4 md:p-6">
    <h1 class="text-3xl font-bold mb-6">Панель Администратора</h1>
    <div>
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
  -->
</template>