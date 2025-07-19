<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useEventStore, type Participation } from '@/stores/events';
import { copyToClipboard } from '@/utils/clipboard';
import { resolveAvatarUrl } from '@/utils/resolve_avatar_url';
import ActionModal from '@/components/ActionModal.vue';

// --- Props (данные от родителя EventDetail.vue) ---
const props = defineProps<{
  eventId: number;
  currentParticipation: Participation | null;
  isCaptain: boolean;
  allTeams: Participation[];
}>();

const emit = defineEmits(['close']);

// --- Инициализация ---
const authStore = useAuthStore();
const eventStore = useEventStore();

// --- Внутреннее состояние ---
const step = ref<'choice' | 'form' | 'list' | 'manage'>(
    props.currentParticipation ? 'manage' : 'choice'
);
const form = reactive({ name: '' });
const isLoading = ref(false);
const copyButtonText = ref('Копировать');
const teamSearchQuery = ref('');
const avatarInput = ref<HTMLInputElement | null>(null);

// --- Логика для ActionModal (уведомления и подтверждения) ---
const showActionModal = ref(false);
const modalConfig = reactive({
  type: 'success' as 'success' | 'error' | 'confirm',
  title: '',
  message: '',
  confirmText: 'Да',
  onConfirm: () => {}
});

// --- Вычисляемые свойства ---
const filteredTeams = computed(() => {
  if (!teamSearchQuery.value) return props.allTeams;
  return props.allTeams.filter(team =>
      team.team_name?.toLowerCase().includes(teamSearchQuery.value.toLowerCase())
  );
});

const inviteLink = computed(() => {
  if (!props.currentParticipation) return '';
  return `${window.location.origin}/events/${props.eventId}?joinTeam=${props.currentParticipation.id}`;
});

function triggerAvatarUpload() {
  avatarInput.value?.click();
}

// --- Обработчики действий (взаимодействие с бэкендом) ---
async function handleCreateTeam() {
  if (!form.name.trim()) return;
  isLoading.value = true;
  try {
    await eventStore.createParticipation(props.eventId, { participant_type: 'team', team_name: form.name });
    await authStore.fetchMyParticipations();
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
  modalConfig.message = `Вы уверены, что хотите расформировать команду "${props.currentParticipation.team_name}"? Это действие необратимо.`;
  modalConfig.onConfirm = async () => {
    try {
      await eventStore.deleteParticipation(props.currentParticipation!.id, props.eventId);
      await authStore.fetchMyParticipations();
      emit('close');
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
  modalConfig.message = 'Вы уверены, что хотите удалить этого участника из команды?';
  modalConfig.onConfirm = async () => {
    try {
      await eventStore.leaveOrKick(props.currentParticipation!.id, props.eventId, userId);
    } finally {
      showActionModal.value = false;
    }
  };
  modalConfig.confirmText = 'Удалить';
  showActionModal.value = true;
}

async function copyLink() {
  const success = await copyToClipboard(inviteLink.value);
  if (success) {
    copyButtonText.value = 'Скопировано!';
    setTimeout(() => { copyButtonText.value = 'Копировать'; }, 2000);
  }
}

async function handleMakeCaptain(userId: string) {
  if (!props.currentParticipation) return;
  modalConfig.onConfirm = async () => {
    try {
      await eventStore.transferCaptaincy(props.currentParticipation!.id, props.eventId, userId);
    } finally { showActionModal.value = false; }
  };
  modalConfig.type = 'confirm';
  modalConfig.title = 'Передача прав';
  modalConfig.message = 'Вы уверены, что хотите назначить этого участника новым капитаном? Вы потеряете свои права.';
  modalConfig.confirmText = 'Назначить';
  showActionModal.value = true;
}

async function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && props.currentParticipation) {
    try {
      await eventStore.uploadTeamAvatar(props.currentParticipation.id, props.eventId, target.files[0]);
    } catch (error) {
      // Обработка ошибки
      modalConfig.type = 'error';
      modalConfig.title = 'Ошибка';
      modalConfig.message = 'Не удалось загрузить аватар.';
      showActionModal.value = true;
    }
  }
}
</script>

<template>
  <div class="p-6">
    <!-- VIEW 1: Управление своей командой -->
    <div v-if="currentParticipation">
      <h2 class="text-2xl font-bold mb-6">{{ currentParticipation.team_name }}</h2>

      <div class="flex flex-col items-center -mt-2 mb-6">
        <img
            :src="resolveAvatarUrl(currentParticipation.team_avatar_url, true)"
            class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-2"
         alt="">
        <button v-if="isCaptain" @click="triggerAvatarUpload" class="text-sm text-primary font-medium hover:underline">
          Сменить аватар
        </button>
        <input type="file" ref="avatarInput" @change="onFileSelected" class="hidden" accept="image/*">
      </div>
      
      <div class="mb-6">
        <h3 class="font-semibold text-gray-800 mb-2">Пригласить в команду</h3>
        <div class="relative">
          <input type="text" readonly :value="inviteLink" class="w-full p-3 pr-10 border rounded-lg bg-gray-100 text-sm text-gray-600 focus:outline-none">
          <button @click="copyLink" :title="copyButtonText" class="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-primary p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </button>
        </div>
      </div>

      <div class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-2">Участники ({{ currentParticipation.members.length }})</h3>
        <ul class="space-y-2">
          <li v-for="member in currentParticipation.members" :key="member.user.id" class="flex items-center justify-between py-2 border-b last:border-b-0">
            <div class="flex items-center gap-3 min-w-0">
              <img :src="resolveAvatarUrl(member.user.avatar_url)" class="w-10 h-10 rounded-full object-cover bg-gray-200 flex-shrink-0" alt="">
              <div class="flex items-baseline gap-2 min-w-0">
                <!-- Сокращение имени (truncate) -->
                <span class="font-medium text-gray-900 truncate" :title="member.user.full_name">{{ member.user.full_name }}</span>
                <!-- Надпись "Капитан" -->
                <span v-if="currentParticipation.creator.id === member.user.id" class="text-xs text-gray-500 font-medium">Капитан</span>
              </div>
            </div>
            <!-- Стилизованные кнопки управления -->
            <div v-if="isCaptain && authStore.user?.id !== member.user.id" class="flex items-center gap-4 flex-shrink-0 ml-2">
              <button @click="handleMakeCaptain(member.user.id)" class="text-sm font-medium text-primary hover:underline">Сделать капитаном</button>
              <button @click="handleKickMember(member.user.id)" class="text-sm font-medium text-red-500 hover:underline">Удалить</button>
            </div>
          </li>
        </ul>
      </div>

      <div class="pt-6 border-t space-y-3">
        <button v-if="!isCaptain || (isCaptain && currentParticipation.members.length > 1)" @click="handleLeaveTeam" class="w-full text-center p-3 font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
          Выйти из команды
        </button>
        <button v-if="isCaptain" @click="handleDisbandTeam" class="w-full text-center p-3 font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Расформировать команду
        </button>
      </div>
    </div>

    <!-- VIEW 2: Пользователь НЕ в команде (выбор, создание, вступление) -->
    <div v-else>
      <div v-if="step === 'choice'">
        <h3 class="text-lg font-bold mb-4">Командное мероприятие</h3>
        <p class="text-gray-600 mb-6">Создайте свою команду или присоединитесь к существующей.</p>
        <div class="flex flex-col gap-4">
          <button @click="step = 'list'" class="w-full text-center p-3 bg-primary text-white rounded-lg hover:opacity-90">Вступить в команду</button>
          <button @click="step = 'form'" class="w-full text-center p-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200">Создать команду</button>
        </div>
      </div>

      <form v-if="step === 'form'" @submit.prevent="handleCreateTeam">
        <h3 class="text-lg font-bold mb-4">Создать команду</h3>
        <div>
          <label for="team-name" class="block text-sm font-medium text-gray-700 mb-1">Название команды</label>
          <input v-model="form.name" type="text" id="team-name" required class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary">
        </div>
        <div class="flex justify-end gap-4 mt-6">
          <button @click="step = 'choice'" type="button" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Назад</button>
          <button type="submit" :disabled="isLoading" class="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 disabled:bg-primary/50">
            {{ isLoading ? 'Создание...' : 'Создать' }}
          </button>
        </div>
      </form>

      <div v-if="step === 'list'">
        <h3 class="text-lg font-bold mb-4">Вступить в команду</h3>
        <p class="text-gray-600 mb-4">Найдите свою команду в списке.</p>
        <div class="border rounded-lg">
          <input v-model="teamSearchQuery" type="text" placeholder="Поиск по названию..." class="w-full p-2 border-b focus:outline-none focus:ring-1 focus:ring-primary rounded-t-lg">
          <ul class="space-y-1 max-h-64 overflow-y-auto p-2">
            <li v-for="team in filteredTeams" :key="team.id" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <p class="font-semibold">{{ team.team_name }}</p>
                <p class="text-sm text-gray-500">{{ team.members.length }} участников</p>
              </div>
              <button @click="handleJoinTeam(team.id)" :disabled="isLoading" class="px-4 py-1 text-sm bg-primary text-white rounded-full hover:opacity-90 disabled:bg-primary/50">Вступить</button>
            </li>
            <li v-if="filteredTeams.length === 0" class="text-center text-gray-500 p-4">Команды не найдены.</li>
          </ul>
        </div>
        <div class="flex justify-end gap-4 mt-6">
          <button @click="step = 'choice'" type="button" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Назад</button>
        </div>
      </div>
    </div>
  </div>

  <ActionModal
      :show="showActionModal"
      :type="modalConfig.type"
      :title="modalConfig.title"
      :message="modalConfig.message"
      @close="showActionModal = false"
      @confirm="modalConfig.onConfirm"
  />
</template>