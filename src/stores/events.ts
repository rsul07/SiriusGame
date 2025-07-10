import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// Раскомментируй для восстановления
// import { fetchEventsApi, fetchEventByIdApi } from '@/api/events'

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

export interface Media {
  id: number
  url: string
  media_type: 'image' | 'document'
  name?: string
  order: number
}

export interface IEvent {
  id: number
  title: string
  is_team: boolean
  date: string
  state: 'future' | 'current' | 'past'
  description: string
  start_time?: string
  end_time?: string
  max_members?: number
  max_teams?: number
  media: Media[]
  leaderboard?: Leader[]
  activities?: Activity[]
}

export const useEventStore = defineStore('events', () => {
  const events = ref<IEvent[]>([])
  const isLoading = ref(false)
  const isLoadingDetail = ref(false)
  const error = ref<string | null>(null)

  const getEventById = computed(() => {
    return (id: number) => events.value.find(event => event.id === id)
  })

  async function fetchEvents(force = false) {
    if (events.value.length > 0 && !force) return
    
    isLoading.value = true
    error.value = null
    
    // Для возращения в нормальное состояние удали
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      events.value = [
        { 
          id: 1, 
          title: 'Летний марафон кода', 
          is_team: false, 
          media: [
            { id: 1, url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop', media_type: 'image', order: 1 },
            // ДОБАВЛЕНЫ ФАЙЛЫ
            { id: 101, url: '/docs/rules.pdf', media_type: 'document', name: 'Правила марафона.pdf', order: 1},
            { id: 102, url: '/docs/tasks.docx', media_type: 'document', name: 'Список заданий.docx', order: 2}
          ],
          date: '15.08.2024', 
          state: 'future', 
          max_members: 120, 
          description: '48 часов беспрерывного кодинга для решения реальных бизнес-задач. Лучшие получат призы от спонсоров и офферы на работу. Погрузитесь в мир алгоритмов и сложных задач, работая плечом к плечу с лучшими разработчиками страны. Мы предоставляем комфортные рабочие места, безлимитный кофе и пиццу.'
        },
        { 
          id: 3, 
          title: 'Чемпионат по робототехнике', 
          is_team: true,
          media: [
            { id: 2, url: 'https://images.unsplash.com/photo-1581093450021-4a7360dde427?q=80&w=1887&auto=format&fit=crop', media_type: 'image', order: 1 },
            // ДОБАВЛЕН ФАЙЛ
            { id: 201, url: '/docs/tech-regulations.pdf', media_type: 'document', name: 'Технический регламент.pdf', order: 1}
          ], 
          date: '25.07.2024', 
          state: 'current', 
          description: 'Соберите и запрограммируйте своего робота для прохождения полосы препятствий. Финальная битва — сегодня вечером! Наблюдайте за сражениями лучших инженерных умов в прямом эфире.',
          leaderboard: [
            { id: 10, name: 'CyberDudes', score: 850, avatarUrl: 'https://i.pravatar.cc/150?u=10' },
            { id: 11, name: 'RoboFriends', score: 820, avatarUrl: 'https://i.pravatar.cc/150?u=11' },
          ]
        },
        { 
          id: 4, 
          title: 'Квиз по DevOps', 
          is_team: false, 
          media: [{ id: 3, url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop', media_type: 'image', order: 1 }],
          date: '01.06.2024', 
          state: 'past', 
          description: 'Интеллектуальный баттл на знание CI/CD, Docker, Kubernetes и облачных технологий. Мероприятие завершено.', 
          leaderboard: [
            { id: 1, name: 'Елена Васильева', score: 100, avatarUrl: 'https://i.pravatar.cc/150?u=1' },
            { id: 2, name: 'Иван Грозный', score: 95, avatarUrl: 'https://i.pravatar.cc/150?u=2' },
          ]
        },
      ];

    } catch (err: any) {
      error.value = err.message || 'Не удалось загрузить мероприятия'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  // Раскомментируй
  //   try {
  //     events.value = await fetchEventsApi()
  //   } catch (err: any) {
  //     error.value = err.message || 'Не удалось загрузить мероприятия'
  //     console.error(err)
  //   } finally {
  //     isLoading.value = false
  //   }
  // }

  // Заглушка для fetchEventByIdApi (Удали)
  async function fetchEventById(id: number): Promise<IEvent | undefined> {
    isLoading.value = true;
    error.value = null;
    try {
      await new Promise(res => setTimeout(res, 300));
      const event = events.value.find(e => e.id === id);
      if (event) {
        if (!event.activities) {
          event.activities = [
            { icon: '🗓️', name: 'Регистрация открыта', color: 'bg-blue-100' },
            { icon: '🎤', name: 'Вступительное слово', color: 'bg-green-100' },
          ]
        }
      }
      return event;
    } catch(err) {
      error.value = 'Не удалось загрузить мероприятие';
      return undefined;
    } finally {
      isLoading.value = false;
    }
  }

  // Раскомментируй
  // async function fetchEventById(id: number): Promise<IEvent | undefined> {
  //   isLoadingDetail.value = true;
  //   error.value = null;
  //   try {
  //     const fetchedEvent = await fetchEventByIdApi(id);
  //     const index = events.value.findIndex(e => e.id === id);

  //     if (index !== -1) {
  //       events.value[index] = { ...events.value[index], ...fetchedEvent };
  //     } else {
  //       events.value.push(fetchedEvent);
  //     }
  //     return events.value.find(e => e.id === id);
  //   } catch (err: any) {
  //     error.value = err.message || `Не удалось загрузить мероприятие с ID ${id}`;
  //     console.error(err);
  //     return undefined;
  //   } finally {
  //     isLoadingDetail.value = false;
  //   }
  // }

  function reset() {
    events.value = []
    error.value = null
  }

  return { 
    events,
    isLoading,
    isLoadingDetail,
    error,
    getEventById,
    fetchEvents,
    fetchEventById,
    reset
  }
})