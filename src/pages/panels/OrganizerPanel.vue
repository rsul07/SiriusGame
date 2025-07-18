<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useEventStore, type IEventCard, type IEventDetail } from '@/stores/events';
import EventCard from '@/components/EventCard.vue';
import ActionModal from '@/components/ActionModal.vue';
import { useEventForm } from '@/composables/useEventForm';
import { useModal } from '@/composables/useModal';
import { useActivities } from '@/composables/useActivities';
import { useEventOperations } from '@/composables/useEventOperations';

const eventStore = useEventStore();

// Композабл-функции
const { 
  form, 
  isCreatingNew, 
  isTeam, 
  validateEventForm, 
  createNewEventForm, 
  setFormData, 
  resetForm 
} = useEventForm();

const { 
  showModal, 
  modalConfig, 
  showSuccessModal, 
  showErrorModal, 
  showConfirmModal, 
  closeModal 
} = useModal();

const {
  selectedEventForActivities,
  addActivityToSelected,
  removeActivityFromSelected,
  isTemporaryId,
  deleteActivityById,
  saveActivities: saveActivitiesComposable,
  setSelectedEventForActivities
} = useActivities();

const {
  createEvent,
  updateEvent,
  deleteEvent: deleteEventOperation,
  handleEventMedia,
  refreshEventData
} = useEventOperations();

// Локальное состояние
const selectedEvent = ref<IEventDetail | null>(null);
const activeTab = ref<'events' | 'activities'>('events');

const futureEvents = computed(() => eventStore.events.filter(e => e.state === 'future'));
const currentEvents = computed(() => eventStore.events.filter(e => e.state === 'current'));
const pastEvents = computed(() => eventStore.events.filter(e => e.state === 'past'));

const selectEventForEditing = async (card: IEventCard) => {
  const full = await eventStore.fetchEventById(card.id);
  if (!full) return;
  
  setFormData(full, false);
  selectedEvent.value = full;
};

const createNewEvent = () => {
  createNewEventForm();
  selectedEvent.value = form.data as IEventDetail;
};

const backToSelection = () => {
  selectedEvent.value = null;
  resetForm();
};

const promptDeleteEvent = (event: IEventCard) => {
  showConfirmModal(
    'Подтвердите удаление',
    `Вы уверены, что хотите удалить мероприятие "${event.title}"? Это действие нельзя отменить.`,
    () => deleteEventHandler(event.id)
  );
};

const deleteEventHandler = async (id: number) => {
  try {
    await deleteEventOperation(id);
    closeModal();
    showSuccessModal('Успешно', 'Мероприятие удалено.');
    await eventStore.fetchEvents(true);
  } catch (error: any) {
    showErrorModal('Ошибка', `Не удалось удалить мероприятие: ${error.message}`);
  }
};

// ===== УПРАВЛЕНИЕ ВКЛАДКАМИ =====

const switchToActivitiesTab = async (event: IEventCard) => {
  const full = await eventStore.fetchEventById(event.id);
  if (!full) return;
  setSelectedEventForActivities(full);
  activeTab.value = 'activities';
};

const selectEventForActivities = async (eventId: number) => {
  const full = await eventStore.fetchEventById(eventId);
  if (!full) return;
  setSelectedEventForActivities(full);
};

// ===== УПРАВЛЕНИЕ АКТИВНОСТЯМИ =====

const deleteActivityFromSelected = async (activity: any, index: number) => {
  if (!selectedEventForActivities.value?.activities) return;
  
  // Если активность имеет реальный ID (не временный), удаляем с сервера
  if (activity.id && !isTemporaryId(activity.id)) {
    showConfirmModal(
      'Подтвердите удаление',
      `Вы уверены, что хотите удалить активность "${activity.name}"?`,
      async () => {
        try {
          await deleteActivityById(activity.id);
          removeActivityFromSelected(index);
          closeModal();
          showSuccessModal('Успешно', 'Активность удалена.');
          // Обновляем данные в store
          await eventStore.fetchEventById(selectedEventForActivities.value!.id, true);
        } catch (error: any) {
          closeModal();
          showErrorModal('Ошибка', `Не удалось удалить активность: ${error.message}`);
        }
      }
    );
  } else {
    // Просто удаляем из локального массива для новых активностей
    removeActivityFromSelected(index);
  }
};

const saveActivities = async () => {
  if (!selectedEventForActivities.value?.activities) return;

  try {
    const eventId = selectedEventForActivities.value.id;
    await saveActivitiesComposable();
    
    // Обновляем данные в store
    await eventStore.fetchEventById(eventId, true);
    
    showSuccessModal('Успешно!', 'Активности сохранены.');
    
    // Обновляем локальные данные
    await selectEventForActivities(eventId);
    
  } catch (error: any) {
    showErrorModal('Ошибка!', `Не удалось сохранить активности: ${error.message}`);
  }
};

const saveEvent = async () => {
  if (!form.data) return;
  
  const validationError = validateEventForm();
  if (validationError) {
    showErrorModal('Ошибка валидации', validationError);
    return;
  }
  
  try {
    let eventId: number;
    
    if (isCreatingNew.value) {
      eventId = await createEvent(form.data);
    } else {
      await updateEvent(selectedEvent.value!.id, form.data);
      eventId = selectedEvent.value!.id;
      
      // Обрабатываем медиа файлы
      const existingMedia = selectedEvent.value!.media || [];
      await handleEventMedia(eventId, existingMedia);
    }
    
    // Если это создание нового события, также обрабатываем медиа
    if (isCreatingNew.value) {
      await handleEventMedia(eventId);
    }
    
    // Обновляем store
    await refreshEventData(eventId);

    showSuccessModal(
      'Успешно!', 
      isCreatingNew.value ? 'Мероприятие успешно создано.' : 'Изменения успешно сохранены.'
    );

    backToSelection();

  } catch (error: any) {
    showErrorModal('Ошибка!', `Не удалось сохранить данные: ${error.message}`);
  }
}

onMounted(() => {
  eventStore.fetchEvents();
});
</script>

<template>
  <div class="p-4 md:p-6">
    <h1 class="text-3xl font-bold mb-6">Панель Организатора</h1>
    
    <!-- Вкладки -->
    <div class="mb-6 border-b flex">
      <button 
        @click="activeTab = 'events'" 
        :class="['py-2 px-4 transition-colors', activeTab === 'events' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700']"
      >
        Мероприятия
      </button>
      <button 
        @click="activeTab = 'activities'" 
        :class="['py-2 px-4 transition-colors', activeTab === 'activities' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700']"
      >
        Активности
      </button>
    </div>

    <!-- Вкладка мероприятий -->
    <div v-if="activeTab === 'events'">
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
                <div class="flex gap-2 mt-2">
                  <button @click="selectEventForEditing(event)" class="flex-1 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">Редактировать</button>
                  <button @click="switchToActivitiesTab(event)" class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Активности</button>
                  <button @click="promptDeleteEvent(event)" class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Удалить</button>
                </div>
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
            <!-- ...existing event form fields... -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Название</label>
              <input v-model="form.data.title" type="text" class="mt-1 w-full p-2 border rounded-md">
            </div>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Дата проведения</label>
                <input v-model="form.data.date" type="text" class="mt-1 w-full p-2 border rounded-md">
              </div>
            </div>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Время начала</label>
                <input v-model="form.data.start_time" type="time" class="mt-1 w-full p-2 border rounded-md" placeholder="09:00">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Время окончания</label>
                <input v-model="form.data.end_time" type="time" class="mt-1 w-full p-2 border rounded-md" placeholder="18:00">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Описание</label>
              <textarea v-model="form.data.description" rows="4" class="mt-1 w-full p-2 border rounded-md"></textarea>
            </div>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">URL изображений (каждый с новой строки)</label>
                <textarea 
                  :value="form.data?.media?.filter(m => m.media_type === 'image').map(m => m.url).join('\n') || ''" 
                  data-media-type="image"
                  rows="3" 
                  class="mt-1 w-full p-2 border rounded-md"
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.png">
                </textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">URL документов (каждый с новой строки)</label>
                <textarea 
                  :value="form.data?.media?.filter(m => m.media_type === 'document').map(m => m.url).join('\n') || ''" 
                  data-media-type="document"
                  rows="3" 
                  class="mt-1 w-full p-2 border rounded-md"
                  placeholder="https://example.com/doc1.pdf&#10;https://example.com/doc2.docx">
                </textarea>
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

    <!-- Вкладка активностей -->
    <div v-if="activeTab === 'activities'">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Управление активностями</h2>
        
        <!-- Селектор мероприятия -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Выберите мероприятие</label>
          <select 
            :value="selectedEventForActivities?.id || ''" 
            @change="selectEventForActivities(Number(($event.target as HTMLSelectElement).value))"
            class="w-full p-2 border rounded-md bg-white"
          >
            <option value="">-- Выберите мероприятие --</option>
            <optgroup label="Будущие">
              <option v-for="event in futureEvents" :key="event.id" :value="event.id">{{ event.title }}</option>
            </optgroup>
            <optgroup label="Текущие">
              <option v-for="event in currentEvents" :key="event.id" :value="event.id">{{ event.title }}</option>
            </optgroup>
            <optgroup label="Прошедшие">
              <option v-for="event in pastEvents" :key="event.id" :value="event.id">{{ event.title }}</option>
            </optgroup>
          </select>
        </div>

        <!-- Управление активностями выбранного мероприятия -->
        <div v-if="selectedEventForActivities">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Активности: {{ selectedEventForActivities.title }}</h3>
            <button @click="addActivityToSelected" class="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">+ Добавить активность</button>
          </div>

          <div v-if="selectedEventForActivities.activities && selectedEventForActivities.activities.length > 0" class="space-y-4 mb-6">
            <div v-for="(activity, index) in selectedEventForActivities.activities" :key="activity.id" class="p-4 bg-gray-50 rounded-lg border">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600">Название</label>
                  <input v-model="activity.name" type="text" class="mt-1 w-full p-2 border rounded">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Иконка</label>
                  <input v-model="activity.icon" type="text" class="mt-1 w-full p-2 border rounded" placeholder="🎯">
                </div>
              </div>
              
              <div class="grid md:grid-cols-2 gap-4 mt-3">
                <div>
                  <label class="block text-sm font-medium text-gray-600">Широта</label>
                  <input v-model.number="activity.latitude" type="number" step="0.000001" class="mt-1 w-full p-2 border rounded">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Долгота</label>
                  <input v-model.number="activity.longitude" type="number" step="0.000001" class="mt-1 w-full p-2 border rounded">
                </div>
              </div>
              
              <div class="grid md:grid-cols-3 gap-4 mt-3">
                <div class="flex items-center">
                  <input v-model="activity.is_scoreable" type="checkbox" class="mr-2">
                  <label class="text-sm font-medium text-gray-600">Оценивается</label>
                </div>
                <div class="flex items-center">
                  <input v-model="activity.is_versus" type="checkbox" class="mr-2">
                  <label class="text-sm font-medium text-gray-600">Соревновательная</label>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Макс. баллы</label>
                  <input v-model.number="activity.max_score" type="number" min="1" class="mt-1 w-full p-2 border rounded">
                </div>
              </div>
              
              <div class="grid md:grid-cols-2 gap-4 mt-3">
                <div>
                  <label class="block text-sm font-medium text-gray-600">Начало</label>
                  <input v-model="activity.start_dt" type="datetime-local" class="mt-1 w-full p-2 border rounded">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Окончание</label>
                  <input v-model="activity.end_dt" type="datetime-local" class="mt-1 w-full p-2 border rounded">
                </div>
              </div>
              
              <div class="flex justify-end mt-3">
                <button @click="deleteActivityFromSelected(activity, index)" class="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700">Удалить</button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            У этого мероприятия пока нет активностей
          </div>

          <div class="flex justify-end">
            <button @click="saveActivities" class="px-6 py-2 text-white bg-primary rounded-md hover:opacity-90">Сохранить изменения</button>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          Выберите мероприятие для управления активностями
        </div>
      </div>
    </div>
    
    <ActionModal 
      :show="showModal" 
      :type="modalConfig.type"
      :title="modalConfig.title"
      :message="modalConfig.message"
      @close="closeModal"
      @confirm="modalConfig.onConfirm"
    />
  </div>
</template> 