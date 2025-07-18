<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useEventStore } from '@/stores/events';
import type { IEventDetail, Participation } from '@/types';
import ActionModal from '@/components/ActionModal.vue';

// --- Props ---
const props = defineProps<{
  eventId: number;
}>();

const emit = defineEmits(['close']);

// --- Инициализация ---
const eventStore = useEventStore();

// --- Состояние формы ---
const form = reactive({
  participationId: null as number | null,
  activityId: null as number | null,
  score: 0,
  reason: '',
});

const isLoading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// --- Логика для ActionModal ---
const showActionModal = ref(false);
const modalConfig = reactive({
  type: 'success' as 'success' | 'error' | 'confirm',
  title: '',
  message: '',
});

// --- Вычисляемые свойства ---
const eventDetails = computed<IEventDetail | undefined>(() => eventStore.detailedEvents[props.eventId]);
const eventParticipations = computed((): Participation[] => eventStore.participationsByEvent[props.eventId] || []);
const scoreableActivities = computed(() => {
  if (!eventDetails.value?.activities) return [];
  return eventDetails.value.activities.filter(a => a.is_scoreable);
});

// --- Загрузка данных ---
onMounted(() => {
  // Данные уже должны быть загружены в EventDetail, но на всякий случай
  eventStore.fetchParticipations(props.eventId);
  eventStore.fetchEventById(props.eventId);
});

// --- Обработчик отправки формы ---
async function handleSubmitScore() {
  if (!props.eventId || !form.participationId) {
    error.value = 'Пожалуйста, выберите участника.';
    return;
  }
  isLoading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    // Предполагаем, что у вас есть action addScore в eventStore
    await eventStore.addScore({
      participation_id: form.participationId,
      activity_id: form.activityId,
      score: form.score,
      reason: form.reason,
    });
    successMessage.value = `Оценка успешно начислена!`;
    form.score = 0;
    form.reason = '';
    form.activityId = null;
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Произошла ошибка.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">Начисление очков</h2>
    <form @submit.prevent="handleSubmitScore" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Выберите команду/участника</label>
        <select v-model="form.participationId" required class="mt-1 w-full p-2 border rounded-md bg-white">
          <option :value="null" disabled>-- Участники --</option>
          <option v-for="p in eventParticipations" :key="p.id" :value="p.id">
            {{ p.team_name || p.creator.fullName }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">За активность (необязательно)</label>
        <select v-model="form.activityId" class="mt-1 w-full p-2 border rounded-md bg-white">
          <option :value="null">Бонусные очки (без активности)</option>
          <option v-for="activity in scoreableActivities" :key="activity.id" :value="activity.id">
            {{ activity.name }} (max: {{ activity.max_score || '∞' }})
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Количество очков</label>
        <input v-model.number="form.score" type="number" required class="mt-1 w-full p-2 border rounded-md">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Комментарий (необязательно)</label>
        <input v-model="form.reason" type="text" class="mt-1 w-full p-2 border rounded-md">
      </div>
      <p v-if="successMessage" class="text-sm text-green-600 pt-2">{{ successMessage }}</p>
      <p v-if="error" class="text-sm text-red-600 pt-2">{{ error }}</p>
      <div class="pt-4 flex justify-end gap-4">
        <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Закрыть</button>
        <button type="submit" :disabled="isLoading" class="px-4 py-2 text-white bg-primary rounded-md hover:opacity-90 disabled:bg-primary/50">
          {{ isLoading ? 'Начисление...' : 'Начислить' }}
        </button>
      </div>
    </form>
  </div>

  <ActionModal
      :show="showActionModal"
      :type="modalConfig.type"
      :title="modalConfig.title"
      :message="modalConfig.message"
      @close="showActionModal = false"
  />
</template>