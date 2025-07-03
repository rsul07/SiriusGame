<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore, type IEvent } from '@/stores/events'
import { useAuthStore } from '@/stores/auth'
import LeaderboardPedestal from '@/components/LeaderboardPedestal.vue'
import Modal from '@/components/Modal.vue'
import { copyToClipboard } from '@/utils/clipboard'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const authStore = useAuthStore()

const event = ref<IEvent | null>(null)
const activeSubTab = ref<'description' | 'activities' | 'leaderboard'>('description')
const showShareMenu = ref(false)
const isViewerOpen = ref(false)
const currentImageIndex = ref(0)
const imageRotation = ref(0)
const copyButtonText = ref('Копировать')

const leaders = computed(() => event.value?.leaderboard || [])
const topThree = computed(() => leaders.value.slice(0, 3))
const theRest = computed(() => leaders.value.slice(3))
const imageViewerStyle = computed(() => ({ transform: `rotate(${imageRotation.value}deg)` }))

onMounted(async () => {
  await loadEventData(route.params.id as string);
})

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await loadEventData(newId as string);
    }
  }
)

async function loadEventData(id: string) {
  if (eventStore.events.length === 0) {
    await eventStore.fetchEvents()
  }
  const foundEvent = eventStore.events.find(e => e.id === Number(id))
  event.value = foundEvent || null
  if (event.value?.state === 'current') {
    activeSubTab.value = 'activities'
  } else {
    activeSubTab.value = 'description'
  }
}

function handleParticipate() {
  if (!authStore.isAuthenticated) {
    authStore.setRedirectPath(route.fullPath)
    router.push({ name: 'Profile' })
  } else {
    alert(`Вы успешно присоединились к "${event.value?.title}"!`)
  }
}

function getShareUrl() { return window.location.href; }

async function copyShareLink() {
  const success = await copyToClipboard(getShareUrl());
  if (success) {
    copyButtonText.value = 'Скопировано!';
    setTimeout(() => {
      copyButtonText.value = 'Копировать';
      showShareMenu.value = false;
    }, 1500);
  } else {
    alert('Не удалось скопировать ссылку. Пожалуйста, сделайте это вручную.');
  }
}

const nextImage = () => { if(event.value) currentImageIndex.value = (currentImageIndex.value + 1) % event.value.imgUrls.length }
const prevImage = () => { if(event.value) currentImageIndex.value = (currentImageIndex.value - 1 + event.value.imgUrls.length) % event.value.imgUrls.length }
const rotateImage = () => { imageRotation.value += 90 }

const openViewer = (index: number) => {
  currentImageIndex.value = index
  imageRotation.value = 0
  isViewerOpen.value = true
}
</script>

<template>
  <div v-if="event" class="bg-bgMain min-h-full">
    <div class="relative w-full h-64 bg-gray-300">
      <img :src="event.imgUrls[0]" alt="Event visual" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      
      <button @click.stop="router.back()" class="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>
      <button @click.stop="showShareMenu = true" class="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684Zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684Z" /></svg></button>
      <button @click.stop="openViewer(0)" class="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 7C3 7.55228 2.55228 8 2 8C1.44772 8 1 7.55228 1 7V3C1 1.89543 1.89543 1 3 1H7C7.55228 1 8 1.44772 8 2C8 2.55228 7.55228 3 7 3H4.41421L10.7071 9.29289C11.0976 9.68342 11.0976 10.3166 10.7071 10.7071C10.3166 11.0976 9.68342 11.0976 9.29289 10.7071L3 4.41422V7Z"/><path d="M21 17C21 16.4477 21.4477 16 22 16C22.5523 16 23 16.4477 23 17V21C23 22.1046 22.1046 23 21 23H17C16.4477 23 16 22.5523 16 22C16 21.4477 16.4477 21 17 21H19.5858L13.2929 14.7071C12.9024 14.3166 12.9024 13.6834 13.2929 13.2929C13.6834 12.9024 14.3166 12.9024 14.7071 13.2929L21 19.5858V17Z"/><path d="M21 7C21 7.55228 21.4477 8 22 8C22.5523 8 23 7.55228 23 7V3C23 1.89543 22.1046 1 21 1H17C16.4477 1 16 1.44772 16 2C16 2.55228 16.4477 3 17 3H19.5858L13.2929 9.29289C12.9024 9.68342 12.9024 10.3166 13.2929 10.7071C13.6834 11.0976 14.3166 11.0976 14.7071 10.7071L21 4.41421V7Z"/><path d="M3 17C3 16.4477 2.55228 16 2 16C1.44772 16 1 16.4477 1 17V21C1 22.1046 1.89543 23 3 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H4.41421L10.7071 14.7071C11.0976 14.3166 11.0976 13.6834 10.7071 13.2929C10.3166 12.9024 9.68342 12.9024 9.29289 13.2929L3 19.5858V17Z"/></svg>
      </button>
    </div>
    
    <div class="p-4">
      <h1 class="text-3xl font-bold mb-4">{{ event.title }}</h1>
      <div class="flex border-b mb-4">
        <button @click="activeSubTab = 'description'" :class="['py-2 px-4', activeSubTab === 'description' ? 'border-b-2 border-primary text-primary' : 'text-gray-500']">Описание</button>
        <button @click="activeSubTab = 'activities'" :class="['py-2 px-4', activeSubTab === 'activities' ? 'border-b-2 border-primary text-primary' : 'text-gray-500']">События</button>
        <button v-if="event.state !== 'future'" @click="activeSubTab = 'leaderboard'" :class="['py-2 px-4', activeSubTab === 'leaderboard' ? 'border-b-2 border-primary text-primary' : 'text-gray-500']">Лидерборд</button>
      </div>
      <div>
        <div v-if="activeSubTab === 'description'"><p class="text-gray-700 leading-relaxed mb-4">{{ event.description }}</p></div>
        <div v-if="activeSubTab === 'activities'"><ul class="space-y-3 mb-4"><li v-for="activity in event.activities" :key="activity.name" class="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"><span :class="['w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0', activity.color]">{{ activity.icon }}</span><span class="font-medium text-gray-800">{{ activity.name }}</span></li></ul></div>
        <div v-if="activeSubTab === 'leaderboard'">
          <LeaderboardPedestal :leaders="topThree" />
          <div class="mt-8"><ul class="space-y-2"><li v-for="(leader, index) in theRest" :key="leader.id" class="flex items-center p-3 bg-white rounded-lg shadow-sm"><span class="w-8 text-gray-500 font-medium">{{ index + 4 }}</span><img :src="leader.avatarUrl" class="w-10 h-10 rounded-full mx-3"><span class="flex-1 font-medium">{{ leader.name }}</span><span class="font-bold">{{ leader.score }}</span></li></ul></div>
        </div>
      </div>
      
      <!-- 👇👇👇 ИЗМЕНЕНИЕ ЗДЕСЬ 👇👇👇 -->
      <!-- Распорка для закрепленного футера. Появляется только когда виден футер. -->
      <!-- h-28 (7rem) для плавающей панели -->
      <div v-if="event.state === 'future'" class="h-28"></div>
    </div>

    <footer v-if="event.state === 'future'" class="fixed bottom-16 left-0 w-full p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 z-40">
      <div class="max-w-md mx-auto"><div class="flex justify-between items-center mb-4 text-center"><div><p class="text-sm text-gray-500">Дата</p><p class="font-bold text-gray-800">{{ event.date }}</p></div><div><p class="text-sm text-gray-500">Участников</p><p class="font-bold text-gray-800">{{ event.participants || 0 }}</p></div><div v-if="event.type === 'team'"><p class="text-sm text-gray-500">Команд</p><p class="font-bold text-gray-800">{{ event.teams || 0 }}</p></div></div><button @click="handleParticipate" class="w-full bg-primary text-white font-bold py-3 rounded-lg text-lg hover:opacity-90 transition-opacity">{{ authStore.isAuthenticated ? 'Участвовать' : 'Войти, чтобы участвовать' }}</button></div>
    </footer>

    <Modal :show="showShareMenu" @close="showShareMenu = false"><div class="p-6"><h3 class="text-lg font-bold mb-4">Поделиться мероприятием</h3><input type="text" readonly :value="getShareUrl()" class="w-full p-2 border rounded bg-gray-100 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"><button @click="copyShareLink" class="w-full bg-primary text-white font-bold py-2 rounded-lg hover:opacity-90">{{ copyButtonText }}</button></div></Modal>
    
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isViewerOpen" @click.self="isViewerOpen = false" class="fixed inset-0 bg-white/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Transition name="image-fade" mode="out-in">
            <img :key="currentImageIndex" :src="event.imgUrls[currentImageIndex]" :style="imageViewerStyle" class="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-300 shadow-2xl rounded-lg">
          </Transition>
          <div class="absolute top-4 left-4 flex gap-2"><button @click="rotateImage" class="h-10 w-10 flex items-center justify-center text-white bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M10 7L9 6L11.2929 3.70711L10.8013 3.21553C10.023 2.43724 8.96744 2 7.86677 2C4.63903 2 2 4.68015 2 7.93274C2 11.2589 4.69868 14 8 14C9.53708 14 11.0709 13.4144 12.2426 12.2426L13.6569 13.6569C12.095 15.2188 10.0458 16 8 16C3.56933 16 0 12.3385 0 7.93274C0 3.60052 3.50968 0 7.86677 0C9.49787 0 11.0622 0.647954 12.2155 1.80132L12.7071 2.29289L15 0L16 1V7H10Z"/></svg></button></div>
          <button @click="isViewerOpen = false" class="h-10 w-10 flex items-center justify-center absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          <button v-if="event.imgUrls.length > 1" @click.stop="prevImage" class="h-10 w-10 flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>
          <button v-if="event.imgUrls.length > 1" @click.stop="nextImage" class="h-10 w-10 flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
        </div>
      </Transition>
    </Teleport>
  </div>
  <div v-else class="text-center pt-20">Загрузка...</div>
</template>

<style scoped>
.image-fade-enter-active,
.image-fade-leave-active {
  transition: opacity 0.3s ease;
}
.image-fade-enter-from,
.image-fade-leave-to {
  opacity: 0;
}
</style>