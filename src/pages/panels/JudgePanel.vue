<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useEventStore } from '@/stores/events';
import type { IEventDetail, Participation } from '@/types';

// --- Инициализация ---
const authStore = useAuthStore();
const eventStore = useEventStore();

// --- Состояние формы ---
const form = reactive({
  eventId: null as number | null,
  participationId: null as number | null,
  activityId: null as number | null, // Может быть null для бонусных очков
  score: 0,
  reason: '',
});

const isLoading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// --- Вычисляемые свойства для списков ---

// Список мероприятий, где пользователь является судьей
const judgeEvents = computed(() => authStore.judgeEvents);

// Детали выбранного мероприятия
const selectedEventDetails = computed<IEventDetail | undefined>(() => {
  if (!form.eventId) return undefined;
  return eventStore.detailedEvents[form.eventId];
});

// Участники/команды выбранного мероприятия
const currentEventParticipations = computed((): Participation[] => {
  if (!form.eventId) return [];
  return eventStore.participationsByEvent[form.eventId] || [];
});

// Только ОЦЕНИВАЕМЫЕ активности выбранного мероприятия
const currentScoreableActivities = computed(() => {
  if (!selectedEventDetails.value?.activities) return [];
  return selectedEventDetails.value.activities.filter(a => a.is_scoreable);
});

// --- Логика загрузки данных ---

// Загружаем мероприятия для судьи при монтировании компонента
onMounted(() => {
  authStore.fetchMyJudgeEvents();
});

// Когда судья выбирает мероприятие, подгружаем его участников и детали (для активностей)
watch(() => form.eventId, (newEventId) => {
  if (newEventId) {
    // Сбрасываем остальные поля
    form.participationId = null;
    form.activityId = null;
    // Загружаем нужные данные
    eventStore.fetchParticipations(newEventId);
    eventStore.fetchEventById(newEventId);
  }
});

// --- Обработчик отправки формы ---
async function handleSubmitScore() {
  if (!form.eventId || !form.participationId) {
    error.value = 'Пожалуйста, выберите мероприятие и участника.';
    return;
  }

  isLoading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    await eventStore.addScore(form.eventId, {
      participation_id: form.participationId,
      activity_id: form.activityId,
      score: form.score,
      reason: form.reason,
    });

    successMessage.value = `Оценка успешно начислена!`;
    // Сбрасываем очки и причину для удобства
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
  <div class="p-4 md:p-6">
    <h1 class="text-3xl font-bold mb-6">Панель Судьи</h1>

    <div class="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 class="text-xl font-bold mb-4">Начисление очков</h2>

      <form @submit.prevent="handleSubmitScore" class="space-y-4">
        <!-- 1. Выбор мероприятия -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Выберите мероприятие</label>
          <select v-model="form.eventId" class="mt-1 w-full p-2 border rounded-md bg-white">
            <option :value="null" disabled>-- Мероприятия --</option>
            <option v-for="event in judgeEvents" :key="event.id" :value="event.id">
              {{ event.title }}
            </option>
          </select>
        </div>

        <!-- Эти поля появляются только после выбора мероприятия -->
        <template v-if="form.eventId">
          <!-- 2. Выбор команды/участника -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Выберите команду/участника</label>
            <select v-model="form.participationId" class="mt-1 w-full p-2 border rounded-md bg-white">
              <option :value="null" disabled>-- Участники --</option>
              <option v-for="p in currentEventParticipations" :key="p.id" :value="p.id">
                {{ p.team_name || p.creator.fullName }}
              </option>
            </select>
          </div>

          <!-- 3. Выбор активности -->
          <div>
            <label class="block text-sm font-medium text-gray-700">За активность (необязательно)</label>
            <select v-model="form.activityId" class="mt-1 w-full p-2 border rounded-md bg-white">
              <option :value="null">Бонусные очки (без активности)</option>
              <option v-for="activity in currentScoreableActivities" :key="activity.id" :value="activity.id">
                {{ activity.name }} (max: {{ activity.max_score || '∞' }})
              </option>
            </select>
          </div>
        </template>

        <!-- Поля для оценки -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Количество очков</label>
          <input v-model.number="form.score" type="number" class="mt-1 w-full p-2 border rounded-md">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Комментарий (необязательно)</label>
          <input v-model="form.reason" type="text" class="mt-1 w-full p-2 border rounded-md">
        </div>

        <!-- Сообщения об успехе/ошибке -->
        <p v-if="successMessage" class="text-sm text-green-600 pt-2">{{ successMessage }}</p>
        <p v-if="error" class="text-sm text-red-600 pt-2">{{ error }}</p>

        <div class="pt-4">
          <button type="submit" :disabled="isLoading" class="w-full px-4 py-2 text-white bg-primary rounded-md hover:opacity-90 disabled:bg-primary/50">
            {{ isLoading ? 'Начисление...' : 'Начислить' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>