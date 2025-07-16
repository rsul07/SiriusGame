<script setup lang="ts">
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore, type IEventDetail, type Media, type Activity, type Participation } from '@/stores/events'
import { useAuthStore } from '@/stores/auth'
import Modal from '@/components/Modal.vue'
import defaultImage from '../assets/default.png'
import ActionModal from '@/components/ActionModal.vue';
import TeamManagementModal from '@/components/TeamManagementModal.vue'
import LeaderboardPedestal from '@/components/LeaderboardPedestal.vue'
import { copyToClipboard } from '@/utils/clipboard'
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
  YandexMapMarker,
  YandexMapControls,
} from 'vue-yandex-maps';

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const authStore = useAuthStore()

const event = ref<IEventDetail | null>(null)
const isLoadingPage = ref(true)
const errorPage = ref<string | null>(null)
const activeSubTab = ref<'description' | 'activities' | 'leaderboard'>('description')
const showTeamManagementModal = ref(false)

const showShareMenu = ref(false)
const isImageViewerOpen = ref(false)
const isMapViewerOpen = ref(false)
const currentImageIndex = ref(0)
const imageRotation = ref(0)
const copyButtonText = ref('Копировать')

const showActionModal = ref(false);
const modalConfig = reactive({
  type: 'success' as 'success' | 'error' | 'confirm',
  title: '',
  message: '',
  onConfirm: () => {}
});

const eventParticipations = computed((): Participation[] => {
  if (!event.value) return [];
  return eventStore.participationsByEvent[event.value.id] || [];
})

const currentUserParticipation = computed(() => {
  if (!authStore.user || !event.value) return null;
  return eventParticipations.value.find(p =>
      p.members.some(m => m.user.id === authStore.user!.id)
  ) || null;
})

const isCaptain = computed(() => {
  if (!authStore.user || !currentUserParticipation.value) return false;
  return currentUserParticipation.value.creator.id === authStore.user.id;
})

const isRegistered = computed(() => !!currentUserParticipation.value);

// НОВОЕ: Функция для обработки ссылки-приглашения
async function handleTeamInvite() {
  const teamIdToJoin = route.query.joinTeam as string;
  if (!teamIdToJoin || !event.value) return;

  // Если пользователь не авторизован, отправляем на страницу входа
  if (!authStore.isAuthenticated) {
    authStore.setRedirectPath(route.fullPath); // Сохраняем полный путь для редиректа
    router.push({ name: 'Profile' });
    return;
  }

  // Если пользователь уже в команде, ничего не делаем
  if (isRegistered.value) {
    await router.replace({query: {...route.query, joinTeam: undefined}});
    return;
  }

  try {
    const participationId = parseInt(teamIdToJoin);
    await eventStore.joinTeam(participationId, event.value.id);
    await authStore.fetchMyParticipations();

    modalConfig.type = 'success';
    modalConfig.title = 'Добро пожаловать!';
    modalConfig.message = 'Вы успешно вступили в команду.';
    showActionModal.value = true;

  } catch (error: any) {
    modalConfig.type = 'error';
    modalConfig.title = 'Ошибка';
    modalConfig.message = error.response?.data?.detail || 'Не удалось вступить в команду по ссылке.';
    showActionModal.value = true;
  } finally {
    await router.replace({query: {...route.query, joinTeam: undefined}});
  }
}

async function loadEventData(id: string) {
  isLoadingPage.value = true;
  errorPage.value = null;
  const eventId = parseInt(id);
  try {
    const [foundEvent] = await Promise.all([
      eventStore.fetchEventById(eventId, true),
      eventStore.fetchParticipations(eventId, true)
    ]);
    if (!foundEvent) throw new Error("Мероприятие не найдено");
    event.value = foundEvent;

    await handleTeamInvite();

    activeSubTab.value = event.value.state === 'current' ? 'activities' : 'description'
  } catch (e: any) {
    errorPage.value = e.message;
  } finally {
    isLoadingPage.value = false;
  }
}

onMounted(() => { loadEventData(route.params.id as string); })
watch(() => route.params.id, (newId) => { if (newId) loadEventData(newId as string); })

function handleParticipate() {
  if (!authStore.isAuthenticated) {
    authStore.setRedirectPath(route.fullPath);
    router.push({ name: 'Profile' });
    return;
  }
  if (event.value?.is_team) {
    showTeamManagementModal.value = true;
  } else {
    if (isRegistered.value) {
      modalConfig.type = 'confirm';
      modalConfig.title = 'Отмена регистрации';
      modalConfig.message = 'Вы уверены, что хотите отменить регистрацию на это мероприятие?';
      modalConfig.onConfirm = async () => {
        if (!event.value || !currentUserParticipation.value) return;
        try {
          await eventStore.deleteParticipation(currentUserParticipation.value.id, event.value.id);
          await authStore.fetchMyParticipations();
          showActionModal.value = false;
        } catch (error) {}
      };
      showActionModal.value = true;
    } else {
      handleIndividualParticipation();
    }
  }
}

async function handleIndividualParticipation() {
  if (!event.value) return;
  try {
    await eventStore.createParticipation(event.value.id, { participant_type: 'individual' });
    await authStore.fetchMyParticipations();
    modalConfig.type = 'success';
    modalConfig.title = 'Успешно!';
    modalConfig.message = `Вы зарегистрировались на мероприятие "${event.value?.title}"!`;
    showActionModal.value = true;
  } catch (error: any) {
    modalConfig.type = 'error';
    modalConfig.title = 'Ошибка';
    modalConfig.message = error.response?.data?.detail || 'Не удалось зарегистрироваться.';
    showActionModal.value = true;
  }
}

const leaders = computed(() => event.value?.leaderboard || [])
const topThree = computed(() => leaders.value.slice(0, 3))
const theRest = computed(() => leaders.value.slice(3))
const imageViewerStyle = computed(() => ({ transform: `rotate(${imageRotation.value}deg)` }))

const eventImages = computed(() => event.value ? event.value.media.filter((m: Media) => m.media_type === 'image').map((m: Media) => m.url) : []);
const eventDocuments = computed(() => event.value ? event.value.media.filter((m: Media) => m.media_type === 'document') : []);
const scoreableActivities = computed(() => event.value?.activities?.filter((a: Activity) => a.is_scoreable) || [])
const informationalActivities = computed(() => event.value?.activities?.filter((a: Activity) => !a.is_scoreable) || [])

const geoActivities = computed(() => {
  return event.value?.activities?.filter((a): a is Activity & { latitude: number; longitude: number } =>
      a.latitude != null && a.longitude != null
  ) || [];
});

const showMap = computed(() => {
  return event.value?.state === 'current' && geoActivities.value.length > 0;
});

const mapSettings = computed(() => {
  const settings: { location: any } = { location: {} };

  if (geoActivities.value.length > 1) {
    settings.location.bounds = geoActivities.value.map(a => [a.longitude, a.latitude]);
  } else if (geoActivities.value.length === 1) {
    settings.location.center = [geoActivities.value[0].longitude, geoActivities.value[0].latitude];
    settings.location.zoom = 15;
  } else {
    settings.location.center = [39.9594, 43.4075];
    settings.location.zoom = 13;
  }
  return settings;
});

const formatTimeRange = (start?: string | null, end?: string | null) => {
  if (!start) return '';
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const startTime = new Date(start).toLocaleTimeString('ru-RU', options);
  if (!end) return `в ${startTime}`;
  const endTime = new Date(end).toLocaleTimeString('ru-RU', options);
  return `${startTime} - ${endTime}`;
}

const formatTime = (dateStr?: string | null, timeStr?: string | null) => {
  if (!dateStr || !timeStr) return '';
  const parts = dateStr.split('.');
  if (parts.length !== 3) return '';
  const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  const dateObj = new Date(`${isoDate}T${timeStr}`);
  if (isNaN(dateObj.getTime())) return '';
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  return dateObj.toLocaleTimeString('ru-RU', options);
}
function getShareUrl() { return window.location.href; }
async function copyShareLink() {
  const success = await copyToClipboard(getShareUrl());
  if (success) {
    copyButtonText.value = 'Скопировано!';
    setTimeout(() => { copyButtonText.value = 'Копировать'; showShareMenu.value = false; }, 1500);
  } else {
    modalConfig.type = 'error';
    modalConfig.title = 'Ошибка';
    modalConfig.message = 'Ваш браузер не поддерживает автоматическое копирование. Пожалуйста, скопируйте ссылку вручную.';
    showActionModal.value = true;
  }
}

const nextImage = () => { if (eventImages.value.length > 0) currentImageIndex.value = (currentImageIndex.value + 1) % eventImages.value.length }
const prevImage = () => { if (eventImages.value.length > 0) currentImageIndex.value = (currentImageIndex.value - 1 + eventImages.value.length) % eventImages.value.length }
const rotateImage = () => { imageRotation.value += 90 }

const openImageViewer = (index: number) => {
  currentImageIndex.value = index
  imageRotation.value = 0
  isImageViewerOpen.value = true
}
const openMapViewer = () => {
  isMapViewerOpen.value = true;
}

</script>

<template>
  <div v-if="isLoadingPage" class="flex items-center justify-center h-full text-gray-500">Загрузка...</div>
  <div v-else-if="errorPage" class="flex items-center justify-center h-full text-red-500 p-4 text-center">{{ errorPage }}</div>
  <div v-else-if="event" class="bg-bgMain min-h-full">
    <!-- Шапка (Карта или Изображение) -->
    <div class="relative w-full h-64 bg-gray-300">
      <div v-if="showMap" class="w-full h-full">
        <yandex-map :settings="mapSettings" width="100%" height="100%" >
          <yandex-map-default-scheme-layer/>
          <yandex-map-default-features-layer/>
          <yandex-map-controls :settings="{ position: 'right' }" />
          <yandex-map-marker v-for="activity in geoActivities" :key="activity.id" :settings="{ coordinates: [activity.longitude, activity.latitude] }">
            <div class="marker-container">
              <span class="marker-icon">{{ activity.icon || '🏆' }}</span>
            </div>
          </yandex-map-marker>
        </yandex-map>
        <button @click.stop="openMapViewer" class="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 7C3 7.55228 2.55228 8 2 8C1.44772 8 1 7.55228 1 7V3C1 1.89543 1.89543 1 3 1H7C7.55228 1 8 1.44772 8 2C8 2.55228 7.55228 3 7 3H4.41421L10.7071 9.29289C11.0976 9.68342 11.0976 10.3166 10.7071 10.7071C10.3166 11.0976 9.68342 11.0976 9.29289 10.7071L3 4.41422V7Z"/><path d="M21 17C21 16.4477 21.4477 16 22 16C22.5523 16 23 16.4477 23 17V21C23 22.1046 22.1046 23 21 23H17C16.4477 23 16 22.5523 16 22C16 21.4477 16.4477 21 17 21H19.5858L13.2929 14.7071C12.9024 14.3166 12.9024 13.6834 13.2929 13.2929C13.6834 12.9024 14.3166 12.9024 14.7071 13.2929L21 19.5858V17Z"/><path d="M21 7C21 7.55228 21.4477 8 22 8C22.5523 8 23 7.55228 23 7V3C23 1.89543 22.1046 1 21 1H17C16.4477 1 16 1.44772 16 2C16 2.55228 16.4477 3 17 3H19.5858L13.2929 9.29289C12.9024 9.68342 12.9024 10.3166 13.2929 10.7071C13.6834 11.0976 14.3166 11.0976 14.7071 10.7071L21 4.41421V7Z"/><path d="M3 17C3 16.4477 2.55228 16 2 16C1.44772 16 1 16.4477 1 17V21C1 22.1046 1.89543 23 3 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H4.41421L10.7071 14.7071C11.0976 14.3166 11.0976 13.6834 10.7071 13.2929C10.3166 12.9024 9.68342 12.9024 9.29289 13.2929L3 19.5858V17Z"/></svg>
        </button>
      </div>
      <div v-else class="w-full h-full">
        <img :src="eventImages[0] || defaultImage" alt="Event visual" class="w-full h-full object-cover">
        <button v-if="eventImages.length > 0" @click.stop="openImageViewer(0)" class="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 7C3 7.55228 2.55228 8 2 8C1.44772 8 1 7.55228 1 7V3C1 1.89543 1.89543 1 3 1H7C7.55228 1 8 1.44772 8 2C8 2.55228 7.55228 3 7 3H4.41421L10.7071 9.29289C11.0976 9.68342 11.0976 10.3166 10.7071 10.7071C10.3166 11.0976 9.68342 11.0976 9.29289 10.7071L3 4.41422V7Z"/><path d="M21 17C21 16.4477 21.4477 16 22 16C22.5523 16 23 16.4477 23 17V21C23 22.1046 22.1046 23 21 23H17C16.4477 23 16 22.5523 16 22C16 21.4477 16.4477 21 17 21H19.5858L13.2929 14.7071C12.9024 14.3166 12.9024 13.6834 13.2929 13.2929C13.6834 12.9024 14.3166 12.9024 14.7071 13.2929L21 19.5858V17Z"/><path d="M21 7C21 7.55228 21.4477 8 22 8C22.5523 8 23 7.55228 23 7V3C23 1.89543 22.1046 1 21 1H17C16.4477 1 16 1.44772 16 2C16 2.55228 16.4477 3 17 3H19.5858L13.2929 9.29289C12.9024 9.68342 12.9024 10.3166 13.2929 10.7071C13.6834 11.0976 14.3166 11.0976 14.7071 10.7071L21 4.41421V7Z"/><path d="M3 17C3 16.4477 2.55228 16 2 16C1.44772 16 1 16.4477 1 17V21C1 22.1046 1.89543 23 3 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H4.41421L10.7071 14.7071C11.0976 14.3166 11.0976 13.6834 10.7071 13.2929C10.3166 12.9024 9.68342 12.9024 9.29289 13.2929L3 19.5858V17Z"/></svg>
        </button>
      </div>
      <div class="absolute inset-0 to-transparent pointer-events-none" :class="{ 'bg-gradient-to-t from-black/30': !showMap }"></div>
      <button @click.stop="router.back()" class="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>
      <button @click.stop="showShareMenu = true" class="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684Zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684Z" /></svg></button>
    </div>

    <!-- Основной контент страницы -->
    <div class="p-4">
      <h1 class="text-3xl font-bold mb-4">{{ event.title }}</h1>
      <div class="flex border-b mb-4">
        <button @click="activeSubTab = 'description'" :class="['py-2 px-4', activeSubTab === 'description' ? 'border-b-2 border-primary text-primary' : 'text-gray-500']">Описание</button>
        <button v-if="event.activities && event.activities.length > 0" @click="activeSubTab = 'activities'" :class="['py-2 px-4', activeSubTab === 'activities' ? 'border-b-2 border-primary text-primary' : 'text-gray-500']">События</button>
        <button v-if="event.state !== 'future' && event.leaderboard && event.leaderboard.length > 0" @click="activeSubTab = 'leaderboard'" :class="['py-2 px-4', activeSubTab === 'leaderboard' ? 'border-b-2 border-primary text-primary' : 'text-gray-500']">Лидерборд</button>
      </div>
      <div>
        <div v-if="activeSubTab === 'description'">
          <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ event.description }}</p>
          <div v-if="eventDocuments.length > 0" class="mt-8">
            <h3 class="text-lg font-bold mb-3">Материалы для скачивания</h3>
            <ul class="space-y-3">
              <li v-for="doc in eventDocuments" :key="doc.id">
                <a :href="doc.url" target="_blank" download class="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all">
                  <div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div>
                  <div class="flex-1 min-w-0"><p class="font-semibold text-gray-800 truncate">{{ doc.name || 'Документ' }}</p><p class="text-sm text-gray-500">Нажмите, чтобы скачать</p></div>
                  <div class="flex-shrink-0"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></div>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div v-if="activeSubTab === 'activities'" class="space-y-6">
          <div v-if="scoreableActivities.length > 0">
            <h3 class="text-lg font-bold mb-3">Оцениваемые</h3>
            <ul class="space-y-3">
              <li v-for="activity in scoreableActivities" :key="activity.id" class="flex items-start gap-4 p-4 rounded-lg shadow-sm border" :class="activity.is_versus ? 'bg-primary/5 border-primary/20' : 'bg-white border-transparent'">
                <span class="text-3xl flex-shrink-0 pt-1">{{ activity.icon || '🏆' }}</span>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-800 leading-tight break-words">{{ activity.name }}</p>
                  <div v-if="activity.start_dt" class="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>{{ formatTimeRange(activity.start_dt, activity.end_dt) }}</span>
                  </div>
                  <div v-if="activity.is_versus" class="mt-2"><span class="text-xs font-bold text-white bg-primary px-2 py-0.5 rounded-full">VS</span></div>
                </div>
                <div v-if="activity.max_score" class="flex-shrink-0 text-right w-20">
                  <p class="text-2xl font-bold text-primary">{{ activity.max_score }}</p>
                  <p class="text-xs text-gray-500 -mt-1">очков</p>
                </div>
              </li>
            </ul>
          </div>
          <div v-if="informationalActivities.length > 0">
            <h3 class="text-lg font-bold mb-3">Информационные</h3>
            <ul class="space-y-3">
              <li v-for="activity in informationalActivities" :key="activity.id" class="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
                <span class="text-3xl flex-shrink-0 pt-1">{{ activity.icon || '📢' }}</span>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-800 leading-tight break-words">{{ activity.name }}</p>
                  <div v-if="activity.start_dt" class="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>{{ formatTimeRange(activity.start_dt, activity.end_dt) }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div v-if="activeSubTab === 'leaderboard'">
          <LeaderboardPedestal :leaders="topThree" />
          <div class="mt-8"><ul class="space-y-2"><li v-for="(leader, index) in theRest" :key="leader.id" class="flex items-center p-3 bg-white rounded-lg shadow-sm"><span class="w-8 text-gray-500 font-medium">{{ index + 4 }}</span><img :src="leader.avatarUrl" class="w-10 h-10 rounded-full mx-3"><span class="flex-1 font-medium">{{ leader.name }}</span><span class="font-bold">{{ leader.score }}</span></li></ul></div>
        </div>
      </div>
      <div v-if="event.state === 'future'" class="h-28 mt-8"></div>
    </div>

    <!-- Футер с кнопкой регистрации -->
    <footer v-if="event.state === 'future'" class="fixed bottom-16 left-0 w-full p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 z-40">
      <div class="max-w-md mx-auto">
        <div class="flex justify-between items-center mb-4 text-center">
          <div><p class="text-sm text-gray-500">Дата</p><p class="font-bold text-gray-800">{{ event.date }}</p></div>
          <div v-if="event.start_time"><p class="text-sm text-gray-500">Начало</p><p class="font-bold text-gray-800">{{ formatTime(event.date, event.start_time) }} по МСК</p></div>
          <div v-if="!event.is_team"><p class="text-sm text-gray-500">Участников</p><p class="font-bold text-gray-800">{{ event.max_members || '∞' }}</p></div>
          <div v-if="event.is_team"><p class="text-sm text-gray-500">Команд</p><p class="font-bold text-gray-800">{{ event.max_teams || '∞' }}</p></div>
        </div>
        <button @click="handleParticipate" :class="['w-full font-bold py-3 rounded-lg text-lg transition-colors', isRegistered && !event.is_team ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-primary text-white hover:opacity-90']">
          <span v-if="!authStore.isAuthenticated">Войти, чтобы участвовать</span>
          <span v-else-if="event.is_team">Команда</span>
          <span v-else-if="isRegistered">Отменить регистрацию</span>
          <span v-else>Участвовать</span>
        </button>
      </div>
    </footer>

    <!-- Модальные окна -->
    <Modal :show="showShareMenu" @close="showShareMenu = false"><div class="p-6"><h3 class="text-lg font-bold mb-4">Поделиться мероприятием</h3><input type="text" readonly :value="getShareUrl()" class="w-full p-2 border rounded bg-gray-100 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"><button @click="copyShareLink" class="w-full bg-primary text-white font-bold py-2 rounded-lg hover:opacity-90">{{ copyButtonText }}</button></div></Modal>

    <Modal :show="showTeamManagementModal" @close="showTeamManagementModal = false">
      <TeamManagementModal
          v-if="event"
          :event-id="event.id"
          :current-participation="currentUserParticipation"
          :is-captain="isCaptain"
          :all-teams="eventParticipations.filter(p => p.participant_type === 'team')"
          @close="showTeamManagementModal = false"
      />
    </Modal>

    <ActionModal
        :show="showActionModal"
        :type="modalConfig.type"
        :title="modalConfig.title"
        :message="modalConfig.message"
        @close="showActionModal = false"
        @confirm="modalConfig.onConfirm"
    />

    <!-- Полноэкранные вьюверы -->
    <Teleport to="body">
      <!-- Полноэкранная карта -->
      <Transition name="modal-fade">
        <div v-if="isMapViewerOpen" @click.self="isMapViewerOpen = false" class="fixed inset-0 bg-white/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <yandex-map :settings="mapSettings" class="rounded-lg shadow-2xl w-full h-full">
            <yandex-map-default-scheme-layer />
            <yandex-map-default-features-layer />
            <yandex-map-controls :settings="{ position: 'right' }" />
            <yandex-map-marker v-for="activity in geoActivities" :key="activity.id" :settings="{ coordinates: [activity.longitude, activity.latitude], zIndex: 10 }">
              <div class="marker-container-fs">
                <span class="marker-icon-fs">{{ activity.icon || '🏆' }}</span>
                <div class="marker-popup">{{ activity.name }}</div>
              </div>
            </yandex-map-marker>
          </yandex-map>
          <button @click="isMapViewerOpen = false" class="h-10 w-10 flex items-center justify-center absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </Transition>

      <!-- Полноэкранное изображение -->
      <Transition name="modal-fade">
        <div v-if="isImageViewerOpen" @click.self="isImageViewerOpen = false" class="fixed inset-0 bg-white/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Transition name="image-fade" mode="out-in">
            <img :key="currentImageIndex" :src="eventImages[currentImageIndex]" :style="imageViewerStyle" class="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-300 shadow-2xl rounded-lg">
          </Transition>
          <div class="absolute top-4 left-4 flex gap-2">
            <button @click="rotateImage" class="h-10 w-10 flex items-center justify-center text-white bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M10 7L9 6L11.2929 3.70711L10.8013 3.21553C10.023 2.43724 8.96744 2 7.86677 2C4.63903 2 2 4.68015 2 7.93274C2 11.2589 4.69868 14 8 14C9.53708 14 11.0709 13.4144 12.2426 12.2426L13.6569 13.6569C12.095 15.2188 10.0458 16 8 16C3.56933 16 0 12.3385 0 7.93274C0 3.60052 3.50968 0 7.86677 0C9.49787 0 11.0622 0.647954 12.2155 1.80132L12.7071 2.29289L15 0L16 1V7H10Z"/></svg></button>
          </div>
          <button @click="isImageViewerOpen = false" class="h-10 w-10 flex items-center justify-center absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          <button v-if="eventImages.length > 1" @click.stop="prevImage" class="h-10 w-10 flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>
          <button v-if="eventImages.length > 1" @click.stop="nextImage" class="h-10 w-10 flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
        </div>
      </Transition>
    </Teleport>

  </div>
  <div v-else class="text-center pt-20">Мероприятие не найдено.</div>
</template>

<style scoped>
/* Стили для кастомных маркеров на карте */
.marker-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
}
.marker-icon {
  font-size: 2rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.marker-container-fs {
  position: relative;
  cursor: pointer;
  transform: translate(-50%, -50%);
}

.marker-icon-fs {
  font-size: 2.5rem;
  text-shadow: 0 3px 6px rgba(0,0,0,0.4);
  transition: transform 0.2s ease;
  transform-origin: bottom center;
}

.marker-popup {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background-color: white;
  color: black;
  padding: 6px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  font-weight: 600;
}

.marker-container-fs:hover .marker-popup {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-15px);
}
.marker-container-fs:hover .marker-icon-fs {
  transform: scale(1.1);
}

/* Стили для анимации модальных окон */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
.image-fade-enter-active, .image-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.image-fade-enter-from, .image-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>