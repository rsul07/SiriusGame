import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IEvent } from './events'
import type { User } from './auth'

export const useAdminStore = defineStore('admin', () => {
  const events = ref<IEvent[]>([])
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAdminEvents() {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const { useEventStore } = await import('@/stores/events')
      const eventStore = useEventStore()
      if (eventStore.events.length === 0) {
        await eventStore.fetchEvents()
      }
      events.value = eventStore.events
    } catch (err) {
      error.value = 'Не удалось загрузить мероприятия'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAdminUsers() {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 700))
      users.value = [
        { id: 'user-123', fullName: 'Администратор Иван', email: 'ivan@example.com', is_superuser: true, is_verified: true, is_2fa_enabled: true, avatarUrl: 'https://i.pravatar.cc/150?u=admin-123' },
        { id: 'user-456', fullName: 'Мария Кузнецова', email: 'maria@example.com', is_superuser: false, is_verified: true, is_2fa_enabled: false, avatarUrl: 'https://i.pravatar.cc/150?u=maria-456' },
        { id: 'user-789', fullName: 'Петр Петров', email: 'petr@example.com', is_superuser: false, is_verified: false, is_2fa_enabled: false, avatarUrl: 'https://i.pravatar.cc/150?u=petr-789' },
      ]
    } catch (err) {
      error.value = 'Не удалось загрузить пользователей'
    } finally {
      isLoading.value = false
    }
  }

  async function updateEvent(eventToUpdate: IEvent) {
    console.log("Updating event:", eventToUpdate.id, eventToUpdate);
    isLoading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = events.value.findIndex(e => e.id === eventToUpdate.id);
      if (index !== -1) {
        events.value[index] = { ...events.value[index], ...eventToUpdate };
      }
    } catch (err) {
      error.value = 'Не удалось обновить мероприятие';
      console.error(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createEvent(newEventData: Omit<IEvent, 'id'>) {
    console.log("Creating new event:", newEventData);
    isLoading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newEvent: IEvent = {
        ...newEventData,
        id: Math.floor(Math.random() * 1000) + 10,
        imgUrls: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop'],
        activities: [],
        leaderboard: [],
      };
      events.value.unshift(newEvent);
      return newEvent;
    } catch (err) {
      error.value = 'Не удалось создать мероприятие';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteEvent(eventId: number) {
    console.log("Deleting event:", eventId);
    isLoading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      events.value = events.value.filter(e => e.id !== eventId);
    } catch (err) {
      error.value = 'Не удалось удалить мероприятие';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUser(userToUpdate: User) {
    console.log("Updating user:", userToUpdate.id, userToUpdate);
    isLoading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = users.value.findIndex(u => u.id === userToUpdate.id);
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...userToUpdate };
      }
    } catch (err) {
      error.value = 'Не удалось обновить пользователя';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUser(userId: string) {
    console.log("Deleting user:", userId);
    isLoading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      users.value = users.value.filter(u => u.id !== userId);
    } catch (err) {
      error.value = 'Не удалось удалить пользователя';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return { 
    events, users, isLoading, error, 
    fetchAdminEvents, fetchAdminUsers,
    updateEvent, createEvent, deleteEvent,
    updateUser, deleteUser
  }
})