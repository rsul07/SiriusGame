import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Notification {
  id: number;
  type: 'event_start' | 'new_score' | 'team_invite';
  message: string;
  isRead: boolean;
  timestamp: string;
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([
    {
      id: 1,
      type: 'event_start',
      message: 'Мероприятие "Чемпионат по робототехнике" скоро начнется!',
      isRead: false,
      timestamp: '5 минут назад'
    },
    {
      id: 2,
      type: 'new_score',
      message: 'Судья начислил вашей команде 50 очков в соревновании "Лайв-кодинг".',
      isRead: false,
      timestamp: '1 час назад'
    },
    {
      id: 3,
      type: 'team_invite',
      message: 'Пользователь Иван Иванов приглашает вас в команду "CyberDudes".',
      isRead: true,
      timestamp: '3 часа назад'
    }
  ]);

  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length);

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.isRead = true);
  };

  return {
    notifications,
    unreadCount,
    markAllAsRead,
  }
})