import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Leader {
  id: number
  name: string
  score: number
  avatarUrl: string
}

export interface Activity {
  icon: string
  name: string
  color: string
}

export interface IEvent {
  id: number
  title: string
  type: 'individual' | 'team'
  imgUrls: string[]
  date: string
  state: 'future' | 'current' | 'past'
  description: string
  participants?: number
  teams?: number
  leaderboard?: Leader[]
  activities?: Activity[]
}

export const useEventStore = defineStore('events', () => {
  const events = ref<IEvent[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchEvents() {
    if (events.value.length > 0) return
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      events.value = [
        { 
          id: 1, 
          title: 'Летний марафон кода', 
          type: 'individual', 
          imgUrls: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop'], 
          date: '15.08.2024', 
          state: 'future', 
          participants: 120, 
          description: '48 часов беспрерывного кодинга для решения реальных бизнес-задач. Лучшие получат призы от спонсоров и офферы на работу. Погрузитесь в мир алгоритмов и сложных задач, работая плечом к плечу с лучшими разработчиками страны. Мы предоставляем комфортные рабочие места, безлимитный кофе и пиццу.',
          activities: [
            { icon: '🚀', name: 'Старт и брифинг', color: 'bg-purple-100' },
            { icon: '💻', name: 'Основной этап', color: 'bg-blue-100' },
            { icon: '🍕', name: 'Перерыв на пиццу', color: 'bg-yellow-100' },
            { icon: '🏆', name: 'Финальные питчи', color: 'bg-green-100' },
          ]
        },
        { 
          id: 2, 
          title: 'Хакатон по UI/UX', 
          type: 'team', 
          imgUrls: ['https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop'], 
          date: '20.09.2024', 
          state: 'future', 
          teams: 15, 
          description: 'Создайте самый удобный и красивый интерфейс для нашего нового продукта. В жюри — ведущие дизайнеры индустрии. Ваша задача — не просто нарисовать макет, а продумать весь пользовательский путь, от первого входа до совершения целевого действия. Лучшая команда получит грант на реализацию своего проекта.',
          activities: [
            { icon: '🎨', name: 'Воркшоп по Figma', color: 'bg-pink-100' },
            { icon: '🤔', name: 'Брейншторм', color: 'bg-orange-100' },
          ]
        },
        { 
          id: 3, 
          title: 'Чемпионат по робототехнике', 
          type: 'team', 
          imgUrls: ['https://images.unsplash.com/photo-1581093450021-4a7360dde427?q=80&w=1887&auto=format&fit=crop', 'https://images.unsplash.com/photo-1531297484001-80022131c5a9?q=80&w=2020&auto=format&fit=crop', 'https://images.unsplash.com/photo-1611946328243-52316a73a3ee?q=80&w=1887&auto=format&fit=crop'], 
          date: '25.07.2024', 
          state: 'current', 
          description: 'Соберите и запрограммируйте своего робота для прохождения полосы препятствий. Финальная битва — сегодня вечером! Наблюдайте за сражениями лучших инженерных умов в прямом эфире.', 
          activities: [
            { icon: '🏁', name: 'Финальная гонка', color: 'bg-red-100' },
            { icon: '🛠️', name: 'Тех-питстоп', color: 'bg-blue-100' },
            { icon: '🏆', name: 'Награждение', color: 'bg-yellow-100' },
            { icon: '🎤', name: 'Спич от спонсора', color: 'bg-green-100' },
          ],
          leaderboard: [
            { id: 10, name: 'CyberDudes', score: 850, avatarUrl: 'https://i.pravatar.cc/150?u=10' },
            { id: 11, name: 'RoboFriends', score: 820, avatarUrl: 'https://i.pravatar.cc/150?u=11' },
            { id: 10, name: 'CyberDudes', score: 850, avatarUrl: 'https://i.pravatar.cc/150?u=10' },
            { id: 11, name: 'RoboFriends', score: 820, avatarUrl: 'https://i.pravatar.cc/150?u=11' },
            { id: 10, name: 'CyberDudes', score: 850, avatarUrl: 'https://i.pravatar.cc/150?u=10' },
            { id: 11, name: 'RoboFriends', score: 820, avatarUrl: 'https://i.pravatar.cc/150?u=11' },
          ]
        },
        { 
          id: 4, 
          title: 'Квиз по DevOps', 
          type: 'individual', 
          imgUrls: ['https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop'], 
          date: '01.06.2024', 
          state: 'past', 
          description: 'Интеллектуальный баттл на знание CI/CD, Docker, Kubernetes и облачных технологий. Мероприятие завершено.',
          activities: [
            { icon: '🧠', name: 'Первый раунд', color: 'bg-gray-100' },
            { icon: '⚡️', name: 'Блиц-опрос', color: 'bg-gray-100' },
          ],
          leaderboard: [
            { id: 1, name: 'Елена Васильева', score: 100, avatarUrl: 'https://i.pravatar.cc/150?u=1' },
            { id: 2, name: 'Иван Грозный', score: 95, avatarUrl: 'https://i.pravatar.cc/150?u=2' },
            { id: 3, name: 'Мария Кузнецова', score: 92, avatarUrl: 'https://i.pravatar.cc/150?u=3' },
            { id: 8, name: 'Алексей Петров', score: 88, avatarUrl: 'https://i.pravatar.cc/150?u=8' },
          ]
        },
      ];
    } catch (err) {
      error.value = 'Не удалось загрузить мероприятия.'
    } finally {
      isLoading.value = false
    }
  }

  return { events, isLoading, error, fetchEvents }
})