<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'
import type { IEvent } from '@/stores/events'
import AdminEditEventModal from '@/components/admin/AdminEditEventModal.vue'
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal.vue'

const adminStore = useAdminStore()
const { events, isLoading } = storeToRefs(adminStore)

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const eventToDelete = ref<IEvent | null>(null)
const selectedEvent = ref<Partial<IEvent> | null>(null)

const openCreateModal = () => {
  selectedEvent.value = null; 
  showEditModal.value = true;
}

const openEditModal = (event: IEvent) => {
  selectedEvent.value = JSON.parse(JSON.stringify(event));
  showEditModal.value = true;
}

const handleSaveEvent = async (eventData: IEvent) => {
  if (eventData.id) {
    await adminStore.updateEvent(eventData);
  } else {
    await adminStore.createEvent(eventData as Omit<IEvent, 'id'>);
  }
  showEditModal.value = false;
}

const openDeleteConfirm = (event: IEvent) => {
  eventToDelete.value = event;
  showDeleteModal.value = true;
}

const confirmDelete = async () => {
  if (eventToDelete.value) {
    await adminStore.deleteEvent(eventToDelete.value.id);
  }
  showDeleteModal.value = false;
  eventToDelete.value = null;
}

onMounted(() => {
  adminStore.fetchAdminEvents()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Управление мероприятиями</h1>
      <button @click="openCreateModal" class="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm">
        Добавить мероприятие
      </button>
    </div>
    
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="border-b bg-gray-50 text-gray-600 uppercase tracking-wider">
          <tr>
            <th class="p-4 font-semibold">ID</th>
            <th class="p-4 font-semibold">Название</th>
            <th class="p-4 font-semibold">Статус</th>
            <th class="p-4 font-semibold">Тип</th>
            <th class="p-4 font-semibold">Дата</th>
            <th class="p-4 font-semibold text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading && events.length === 0">
            <td colspan="6" class="p-4 text-center text-gray-500">Загрузка...</td>
          </tr>
          <tr v-for="event in events" :key="event.id" class="border-b hover:bg-gray-50">
            <td class="p-4 text-gray-500">{{ event.id }}</td>
            <td class="p-4 font-medium text-gray-900">{{ event.title }}</td>
            <td class="p-4"><span class="px-2 py-1 text-xs rounded-full font-semibold" :class="{
              'bg-blue-100 text-blue-800': event.state === 'future',
              'bg-red-100 text-red-800': event.state === 'current',
              'bg-gray-200 text-gray-800': event.state === 'past',
            }">{{ event.state }}</span></td>
            <td class="p-4 capitalize">{{ event.type }}</td>
            <td class="p-4">{{ new Date(event.event_date).toLocaleDateString() }}</td>
            <td class="p-4 text-right">
              <button @click="openEditModal(event)" class="text-primary hover:underline font-medium">Редактировать</button>
              <button @click="openDeleteConfirm(event)" class="ml-4 text-red-600 hover:underline font-medium">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminEditEventModal 
      :show="showEditModal" 
      :event="selectedEvent"
      @close="showEditModal = false"
      @save="handleSaveEvent"
    />
    <ConfirmDeleteModal
      :show="showDeleteModal"
      title="Удалить мероприятие"
      :message="`Вы уверены, что хотите удалить мероприятие '${eventToDelete?.title}'? Это действие необратимо.`"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>