<script setup lang="ts">
import {ref, reactive, computed} from 'vue';
import {useAuthStore} from '@/stores/auth';
import {useEventStore, type Participation} from '@/stores/events'; // <-- Импортируем наш стор и тип
import {copyToClipboard} from '@/utils/clipboard';
import ActionModal from '@/components/ActionModal.vue';

// --- Props ---
const props = defineProps<{
  eventId: number;
  currentParticipation: Participation | null;
  isCaptain: boolean;
  allTeams: Participation[];
}>();

// --- Emits ---
const emit = defineEmits(['close']);

// --- Инициализация сторов ---
const authStore = useAuthStore();
const eventStore = useEventStore();

// --- Локальное состояние компонента ---
const step = ref<'choice' | 'form' | 'list' | 'link' | 'manage'>(props.currentParticipation ? 'manage' : 'choice');
const form = reactive({name: ''});
const isLoading = ref(false);
const copyButtonText = ref('Копировать');
const teamSearchQuery = ref('');

// --- Логика для ActionModal ---
const showActionModal = ref(false);
const modalConfig = reactive({
  type: 'success' as 'success' | 'error' | 'confirm',
  title: '',
  message: '',
  onConfirm: () => {
  }
});

// --- Вычисляемые свойства (Computed) ---

// Список команд для вступления (все команды, кроме той, где пользователь уже состоит)
const availableTeams = computed(() => {
  return props.allTeams.filter(team =>
      !props.currentParticipation || team.id !== props.currentParticipation.id
  );
});

// Фильтрованный список команд на основе поиска
const filteredTeams = computed(() => {
  if (!teamSearchQuery.value) return availableTeams.value;
  return availableTeams.value.filter(team =>
      team.team_name?.toLowerCase().includes(teamSearchQuery.value.toLowerCase())
  );
});

const inviteLink = computed(() => {
  if (!props.currentParticipation) return '';
  // Генерируем ссылку, которую можно будет обработать на фронтенде
  return `${window.location.origin}/events/${props.eventId}?joinTeam=${props.currentParticipation.id}`;
});


// --- Обработчики действий (Actions) ---
async function handleCreateTeam() {
  if (!form.name.trim()) return;
  isLoading.value = true;
  try {
    await eventStore.createParticipation(props.eventId, {
      participant_type: 'team',
      team_name: form.name
    });
    await authStore.fetchMyParticipations(); // Обновляем данные пользователя
    emit('close'); // Закрываем модалку после успеха
  } catch (error: any) {
    modalConfig.type = 'error';
    modalConfig.title = 'Ошибка';
    modalConfig.message = error.response?.data?.detail || 'Не удалось создать команду.';
    showActionModal.value = true;
  } finally {
    isLoading.value = false;
  }
}

async function handleJoinTeam(participationId: number) {
  isLoading.value = true;
  try {
    await eventStore.joinTeam(participationId, props.eventId);
    await authStore.fetchMyParticipations();
    emit('close');
  } catch (error: any) {
    modalConfig.type = 'error';
    modalConfig.title = 'Ошибка';
    modalConfig.message = error.response?.data?.detail || 'Не удалось вступить в команду.';
    showActionModal.value = true;
  } finally {
    isLoading.value = false;
  }
}

async function handleLeaveTeam() {
  if (!props.currentParticipation || !authStore.user) return;
  modalConfig.type = 'confirm';
  modalConfig.title = 'Выход из команды';
  modalConfig.message = 'Вы уверены, что хотите выйти из команды?';
  modalConfig.onConfirm = async () => {
    try {
      await eventStore.leaveOrKick(props.currentParticipation!.id, props.eventId, authStore.user!.id);
      await authStore.fetchMyParticipations();
      emit('close');
    } catch (error: any) {
      // ... обработка ошибки
    } finally {
      showActionModal.value = false;
    }
  };
  showActionModal.value = true;
}

async function handleDisbandTeam() {
  if (!props.currentParticipation) return;
  modalConfig.type = 'confirm';
  modalConfig.title = 'Расформировать команду';
  modalConfig.message = `Вы уверены, что хотите расформировать команду "${props.currentParticipation.team_name}"? Все участники будут исключены.`;
  modalConfig.onConfirm = async () => {
    try {
      await eventStore.deleteParticipation(props.currentParticipation!.id, props.eventId);
      await authStore.fetchMyParticipations();
      emit('close');
    } catch (error: any) {
      // ... обработка ошибки
    } finally {
      showActionModal.value = false;
    }
  };
  showActionModal.value = true;
}

async function handleKickMember(userId: string) {
  if (!props.currentParticipation) return;
  modalConfig.type = 'confirm';
  modalConfig.title = 'Удаление участника';
  modalConfig.message = `Вы уверены, что хотите удалить участника из команды?`;
  modalConfig.onConfirm = async () => {
    try {
      await eventStore.leaveOrKick(props.currentParticipation!.id, props.eventId, userId);
      // Данные обновятся автоматически, так как стор реактивен
    } catch (error: any) {
      // ... обработка ошибки
    } finally {
      showActionModal.value = false;
    }
  };
  showActionModal.value = true;
}

async function copyLink() {
  await copyToClipboard(inviteLink.value);
  copyButtonText.value = 'Скопировано!';
  setTimeout(() => {
    copyButtonText.value = 'Копировать';
  }, 2000)
}
</script>

<template>
  <div class="p-6">
    <!-- VIEW 1: Управление своей командой -->
    <div v-if="currentParticipation">
      <h2 class="text-xl font-bold mb-4">{{ currentParticipation.team_name }}</h2>

      <!-- Приглашение в команду (только для капитана) -->
      <div v-if="isCaptain" class="mb-6">
        <h3 class="font-semibold mb-2">Пригласить в команду</h3>
        <div class="relative">
          <input type="text" readonly :value="inviteLink"
                 class="w-full p-2 pr-10 border rounded bg-gray-100 text-sm text-gray-600">
          <button @click="copyLink" :title="copyButtonText"
                  class="absolute top-1/2 right-1 -translate-y-1/2 text-gray-500 hover:text-primary p-1">
            <svg class="w-5 h-5" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Список участников -->
      <div>
        <h3 class="font-semibold mb-2">Участники команды ({{ currentParticipation.members.length }})</h3>
        <ul class="space-y-2">
          <li v-for="member in currentParticipation.members" :key="member.user.id"
              class="flex items-center justify-between p-2">
            <div class="flex items-center gap-3">
              <img :src="member.user.avatarUrl || '/img/icons/default-avatar.svg'" class="w-8 h-8 rounded-full" alt="">
              <span class="font-medium">{{ member.user.fullName }}</span>
            </div>
            <button v-if="isCaptain && authStore.user?.id !== member.user.id" @click="handleKickMember(member.user.id)"
                    class="text-xs text-red-500 hover:underline">Удалить
            </button>
          </li>
        </ul>
      </div>

      <!-- Кнопки действий -->
      <div class="mt-6 pt-6 border-t">
        <button v-if="isCaptain" @click="handleDisbandTeam"
                class="w-full text-center p-3 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
          Расформировать команду
        </button>
        <button v-else @click="handleLeaveTeam"
                class="w-full text-center p-3 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
          Выйти из команды
        </button>
      </div>
    </div>

    <!-- VIEW 2: Пользователь НЕ в команде (создать/вступить) -->
    <div v-else>
      <!-- Шаг 1: Выбор действия -->
      <div v-if="step === 'choice'">
        <h3 class="text-lg font-bold mb-4">Командное мероприятие</h3>
        <p class="text-gray-600 mb-6">Создайте свою команду или присоединитесь к существующей.</p>
        <div class="flex flex-col gap-4">
          <button @click="step = 'list'"
                  class="w-full text-center p-3 bg-primary text-white rounded-lg hover:opacity-90">Вступить в команду
          </button>
          <button @click="step = 'form'" class="w-full text-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200">Создать
            команду
          </button>
        </div>
      </div>

      <!-- Шаг 2 (Вариант А): Форма создания -->
      <form v-if="step === 'form'" @submit.prevent="handleCreateTeam">
        <h3 class="text-lg font-bold mb-4">Создать команду</h3>
        <div>
          <label for="team-name" class="block text-sm font-medium text-gray-700">Название команды</label>
          <input v-model="form.name" type="text" id="team-name" required class="mt-1 w-full p-2 border rounded-md">
        </div>
        <div class="flex justify-end gap-4 mt-6">
          <button @click="step = 'choice'" type="button" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
            Назад
          </button>
          <button type="submit" :disabled="isLoading"
                  class="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 disabled:bg-gray-400">
            {{ isLoading ? 'Создание...' : 'Создать' }}
          </button>
        </div>
      </form>

      <!-- Шаг 2 (Вариант Б): Список команд для вступления -->
      <div v-if="step === 'list'">
        <h3 class="text-lg font-bold mb-4">Вступить в команду</h3>
        <div class="border rounded-lg">
          <input v-model="teamSearchQuery" type="text" placeholder="Поиск по названию..."
                 class="w-full p-2 border-b focus:outline-none focus:ring-1 focus:ring-primary">
          <ul class="space-y-1 max-h-64 overflow-y-auto p-2">
            <li v-for="team in filteredTeams" :key="team.id"
                class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <p class="font-semibold">{{ team.team_name }}</p>
                <p class="text-sm text-gray-500">{{ team.members.length }} участников</p>
              </div>
              <button @click="handleJoinTeam(team.id)" :disabled="isLoading"
                      class="px-4 py-1 text-sm bg-primary text-white rounded-full hover:opacity-90 disabled:bg-gray-300">
                Вступить
              </button>
            </li>
            <li v-if="filteredTeams.length === 0" class="text-center text-gray-500 p-4">Команды не найдены.</li>
          </ul>
        </div>
        <div class="flex justify-end gap-4 mt-6">
          <button @click="step = 'choice'" type="button" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
            Назад
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Вспомогательная модалка для подтверждений -->
  <ActionModal
      :show="showActionModal"
      :type="modalConfig.type"
      :title="modalConfig.title"
      :message="modalConfig.message"
      @close="showActionModal = false"
      @confirm="modalConfig.onConfirm"
  />
</template>