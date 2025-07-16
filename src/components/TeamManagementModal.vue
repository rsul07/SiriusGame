<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { copyToClipboard } from '@/utils/clipboard';
import ActionModal from '@/components/ActionModal.vue'; 

const emit = defineEmits(['close']);
const authStore = useAuthStore();

const showActionModal = ref(false);
const modalConfig = reactive({
  type: 'success' as 'success' | 'error' | 'confirm',
  title: '',
  message: '',
  onConfirm: () => {}
});

const step = ref<'choice' | 'form' | 'list' | 'link'>('choice');
const action = ref<'join' | 'create'>('create');
const form = reactive({ name: '' });
const inviteLink = ref('');
const isLoading = ref(false);
const copyButtonText = ref('Копировать');

const createdTeamName = ref('');

const foundTeams = ref([
    { id: 1, name: 'CyberDudes', members: 3, maxMembers: 5 },
    { id: 2, name: 'RoboFriends', members: 5, maxMembers: 5 },
]);

const teamSearchQuery = ref('');
const filteredTeams = computed(() => {
  if (!teamSearchQuery.value) return foundTeams.value;
  return foundTeams.value.filter(team => team.name.toLowerCase().includes(teamSearchQuery.value.toLowerCase()));
});

const handleCreate = async () => {
  if (!form.name.trim()) {
    modalConfig.type = 'error';
    modalConfig.title = 'Ошибка';
    modalConfig.message = 'Введите название команды';
    showActionModal.value = true;
    return;
  }
  isLoading.value = true;
  try {
    // Симулируем создание команды и обновление стора
    await authStore.joinOrCreateTeam('create', form);
    
    // Сохраняем название локально для отображения
    createdTeamName.value = form.name;
    
    // Сбрасываем форму
    form.name = '';
    // Модальное окно автоматически переключится на v-if="authStore.user?.teamId"
    
  } finally {
    isLoading.value = false;
  }
}

const joinSelectedTeam = (teamName: string) => {
  modalConfig.type = 'success';
  modalConfig.title = 'Успешно';
  modalConfig.message = `Запрос на вступление в команду "${teamName}" отправлен.`;
  showActionModal.value = true;
  // Закрываем основное окно после показа уведомления
  setTimeout(() => emit('close'), 2000);
}

async function copyLink() {
  const success = await copyToClipboard(inviteLink.value);
  if (success) {
    copyButtonText.value = 'Скопировано!';
    setTimeout(() => { copyButtonText.value = 'Копировать'; }, 2000)
  }
}

// const handleLeaveTeam = () => {
//   modalConfig.type = 'confirm';
//   modalConfig.title = 'Выход из команды';
//   modalConfig.message = 'Вы уверены, что хотите выйти из команды? Это действие необратимо.';
//   modalConfig.onConfirm = () => {
//     authStore.leaveTeam();
//     showActionModal.value = false;
//     emit('close');
//   };
//   showActionModal.value = true;
// }


// const disbandTeam = () => {
//   modalConfig.type = 'confirm';
//   modalConfig.title = 'Расформировать команду';
//   modalConfig.message = `Вы уверены, что хотите расформировать команду "${createdTeamName.value}"?`;
//   modalConfig.onConfirm = () => {
//     authStore.leaveTeam();
//     showActionModal.value = false;
//     emit('close');
//   };
//   showActionModal.value = true;
// }

// Эта логика останется для будущего, когда появятся реальные заявки
// const handleApplication = (applicant: { id: string, name: string }, accept: boolean) => {
//   const actionText = accept ? 'принята' : 'отклонена';
//   modalConfig.type = 'success';
//   modalConfig.title = 'Готово';
//   modalConfig.message = `Заявка от пользователя ${applicant.name} ${actionText}.`;
//   showActionModal.value = true;
//   createdTeamName.value.applicants = createdTeamName.value.applicants.filter(a => a.id !== applicant.id);
// }

// Эта логика останется для будущего
// const removeMember = (member: { id: string, name: string }) => {
//   modalConfig.type = 'confirm';
//   modalConfig.title = 'Удаление участника';
//   modalConfig.message = `Вы уверены, что хотите удалить ${member.name} из команды?`;
//   modalConfig.onConfirm = () => {
//     createdTeamName.value.members = createdTeamName.value.members.filter(m => m.id !== member.id);
//     showActionModal.value = false;
//     modalConfig.type = 'success';
//     modalConfig.title = 'Успешно';
//     modalConfig.message = `Пользователь ${member.name} удален.`;
//     showActionModal.value = true;
//   };
//   showActionModal.value = true;
// }

onMounted(() => {
  if (!authStore.user?.teamId) {
    step.value = 'choice';
  }
});
</script>

<template>
  <div class="p-6">
    <div v-if="authStore.user?.teamId">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">{{ createdTeamName || 'Ваша команда' }}</h2>
        <!-- <span class="text-gray-500 font-medium">{{ createdTeamName.members.length }} / {{ createdTeamName.maxMembers }}</span> -->
      </div>

      <!-- <div v-if="authStore.user?.isCaptain && createdTeamName.applicants.length > 0" class="mb-6">
        <h3 class="font-semibold mb-2">Заявки на вступление</h3>
        <ul class="space-y-2">
          <li v-for="applicant in createdTeamName.applicants" :key="applicant.id" class="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
            <div class="flex items-center gap-3"><img :src="applicant.avatarUrl" class="w-8 h-8 rounded-full"><span class="font-medium">{{ applicant.name }}</span></div>
            <div class="flex gap-2">
              <button @click="handleApplication(applicant, true)" title="Принять" class="h-8 w-8 flex items-center justify-center bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></button>
              <button @click="handleApplication(applicant, false)" title="Отклонить" class="h-8 w-8 flex items-center justify-center bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
          </li>
        </ul>
      </div> -->
      
      <div v-if="authStore.user?.isCaptain" class="mb-6">
        <h3 class="font-semibold mb-2">Пригласить в команду</h3>
        <div class="relative"><input type="text" readonly :value="`https://sirius.game/join?team=${authStore.user?.teamId}`" class="w-full p-2 pr-10 border rounded bg-gray-100 text-sm text-gray-600"><button @click="copyLink" :title="copyButtonText" class="absolute top-1/2 right-1 -translate-y-1/2 text-gray-500 hover:text-primary p-1"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button></div>
      </div>
      
      <!-- <div>
        <h3 class="font-semibold mb-2">Участники команды</h3>
        <ul class="space-y-2">
          <li v-for="member in createdTeamName.members" :key="member.id" class="flex items-center justify-between p-2">
            <div class="flex items-center gap-3"><img :src="member.avatarUrl" class="w-8 h-8 rounded-full"><span class="font-medium">{{ member.name }}</span></div>
            <button v-if="authStore.user?.isCaptain && authStore.user.id !== member.id" @click="removeMember(member)" class="text-xs text-red-500 hover:underline">Удалить</button>
          </li>
        </ul>
      </div> -->

      <!-- <div class="mt-6 pt-6 border-t">
        <button v-if="authStore.user?.isCaptain && createdTeamName.members.length === 1" @click="disbandTeam" class="w-full text-center p-3 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Расформировать команду</button>
        <button v-else @click="handleLeaveTeam" class="w-full text-center p-3 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Выйти из команды</button>
      </div> -->
    </div>
    
    <div v-else>
      <div v-if="step === 'choice'">
        <h3 class="text-lg font-bold mb-4">Командное мероприятие</h3>
        <p class="text-gray-600 mb-6">Создайте свою команду или присоединитесь к существующей.</p>
        <div class="flex flex-col gap-4">
          <button @click="action = 'join'; step = 'list'" class="w-full text-center p-3 bg-primary text-white rounded-lg hover:opacity-90">Вступить в команду</button>
          <button @click="action = 'create'; step = 'form'" class="w-full text-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200">Создать команду</button>
        </div>
      </div>

      <form v-if="step === 'form'" @submit.prevent="handleCreate">
        <h3 class="text-lg font-bold mb-4">Создать команду</h3>
        <div>
          <label for="team-name" class="block text-sm font-medium text-gray-700">Название команды</label>
          <input v-model="form.name" type="text" id="team-name" required class="mt-1 w-full p-2 border rounded-md">
        </div>
        <div class="flex justify-end gap-4 mt-6">
          <button @click="step = 'choice'" type="button" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Назад</button>
          <button type="submit" :disabled="isLoading" class="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 disabled:bg-gray-400">{{ isLoading ? 'Создание...' : 'Создать' }}</button>
        </div>
      </form>
      
      <div v-if="step === 'list'">
          <h3 class="text-lg font-bold mb-4">Вступить в команду</h3>
          <p class="text-gray-600 mb-4">Найдите свою команду в списке.</p>
          <div class="border rounded-lg">
            <input v-model="teamSearchQuery" type="text" placeholder="Поиск по названию..." class="w-full p-2 border-b focus:outline-none focus:ring-1 focus:ring-primary">
            <ul class="space-y-1 max-h-64 overflow-y-auto p-2">
                <li v-for="team in filteredTeams" :key="team.id" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div><p class="font-semibold">{{ team.name }}</p><p class="text-sm text-gray-500">{{ team.members }}/{{ team.maxMembers }}</p></div>
                    <button @click="joinSelectedTeam(team.name)" :disabled="team.members >= team.maxMembers" class="px-4 py-1 text-sm bg-primary text-white rounded-full hover:opacity-90 disabled:bg-gray-300">Вступить</button>
                </li>
                <li v-if="filteredTeams.length === 0" class="text-center text-gray-500 p-4">Команды не найдены.</li>
            </ul>
          </div>
           <div class="flex justify-end gap-4 mt-6">
              <button @click="step = 'choice'" type="button" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Назад</button>
          </div>
      </div>

      <div v-if="step === 'link'">
        <h3 class="text-lg font-bold mb-4">Команда создана!</h3>
        <p class="text-gray-600 mb-4">Поделитесь этой ссылкой с друзьями.</p>
        <div class="relative">
          <input type="text" readonly :value="inviteLink" class="w-full p-2 pr-10 border rounded bg-gray-100 text-sm text-gray-600">
          <button @click="copyLink" :title="copyButtonText" class="absolute top-1/2 right-1 -translate-y-1/2 text-gray-500 hover:text-primary p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </button>
        </div>
        <div class="flex justify-end mt-6">
          <button @click="$emit('close')" type="button" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Закрыть</button>
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