<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore, type IEvent } from '@/stores/events'
import { useAuthStore } from '@/stores/auth'
import LeaderboardPedestal from '@/components/LeaderboardPedestal.vue'
import Modal from '@/components/Modal.vue'

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
  if (eventStore.events.length === 0) {
    await eventStore.fetchEvents()
  }
  const foundEvent = eventStore.events.find(e => e.id === Number(route.params.id))
  event.value = foundEvent || null
  if (event.value?.state === 'current') activeSubTab.value = 'activities'
})

function handleParticipate() {
  if (!authStore.isAuthenticated) {
    authStore.setRedirectPath(route.fullPath)
    router.push({ name: 'Profile' })
  } else {
    alert(`Вы успешно присоединились к "${event.value?.title}"!`)
  }
}

function getShareUrl() { return window.location.href; }
async function copyShareLink() { /* ... */ }
const nextImage = () => { if(event.value) currentImageIndex.value = (currentImageIndex.value + 1) % event.value.imgUrls.length }
const prevImage = () => { if(event.value) currentImageIndex.value = (currentImageIndex.value - 1 + event.value.imgUrls.length) % event.value.imgUrls.length }
const rotateImage = () => { imageRotation.value = (imageRotation.value + 90) % 360 }
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
      <button @click.stop="router.back()" class="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>
      <button @click.stop="showShareMenu = true" class="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684Zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684Z" /></svg></button>
      <button @click.stop="openViewer(0)" class="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg></button>
    </div>
    
    <div :class="{'pb-32' : event.state === 'future'}">
      <div class="p-4">
        <h1 class="text-3xl font-bold mb-4">{{ event.title }}</h1>
        <div class="flex border-b mb-4">
          <button v-if="event.state !== 'current'" @click="activeSubTab = 'description'" :class="['py-2 px-4', activeSubTab === 'description' ? 'border-b-2 border-primary text-primary' : 'text-gray-500']">Описание</button>
          <button @click="activeSubTab = 'activities'" :class="['py-2 px-4', activeSubTab === 'activities' ? 'border-b-2 border-primary text-primary' : 'text-gray-500']">События</button>
          <button v-if="event.state !== 'future'" @click="activeSubTab = 'leaderboard'" :class="['py-2 px-4', activeSubTab === 'leaderboard' ? 'border-b-2 border-primary text-primary' : 'text-gray-500']">Лидерборд</button>
        </div>
        <div>
          <div v-if="activeSubTab === 'description'">
            <p class="text-gray-700 leading-relaxed mb-4">{{ event.description }}</p>
          </div>
          <div v-if="activeSubTab === 'activities'">
            <ul class="space-y-3 mb-4">
              <li v-for="activity in event.activities" :key="activity.name" class="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <span :class="['w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0', activity.color]">{{ activity.icon }}</span>
                <span class="font-medium text-gray-800">{{ activity.name }}</span>
              </li>
            </ul>
          </div>
          <div v-if="activeSubTab === 'leaderboard'">
            <LeaderboardPedestal :leaders="topThree" />
            <div class="mt-8"><ul class="space-y-2"><li v-for="(leader, index) in theRest" :key="leader.id" class="flex items-center p-3 bg-white rounded-lg shadow-sm"><span class="w-8 text-gray-500 font-medium">{{ index + 4 }}</span><img :src="leader.avatarUrl" class="w-10 h-10 rounded-full mx-3"><span class="flex-1 font-medium">{{ leader.name }}</span><span class="font-bold">{{ leader.score }}</span></li></ul></div>
          </div>
        </div>
      </div>
    </div>

    <footer v-if="event.state === 'future'" class="fixed bottom-16 left-0 w-full p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200">
      <div class="max-w-md mx-auto">
        <div class="flex justify-between items-center mb-4 text-center">
          <div><p class="text-sm text-gray-500">Дата</p><p class="font-bold text-gray-800">{{ event.date }}</p></div>
          <div><p class="text-sm text-gray-500">Участников</p><p class="font-bold text-gray-800">{{ event.participants || 0 }}</p></div>
          <div v-if="event.type === 'team'"><p class="text-sm text-gray-500">Команд</p><p class="font-bold text-gray-800">{{ event.teams || 0 }}</p></div>
        </div>
        <button @click="handleParticipate" class="w-full bg-primary text-white font-bold py-3 rounded-lg text-lg hover:bg-blue-700">{{ authStore.isAuthenticated ? 'Участвовать' : 'Войти, чтобы участвовать' }}</button>
      </div>
    </footer>

    <Modal :show="showShareMenu" @close="showShareMenu = false">
      <div class="p-6">
        <h3 class="text-lg font-bold mb-4">Поделиться мероприятием</h3>
        <input type="text" readonly :value="getShareUrl()" class="w-full p-2 border rounded bg-gray-100 mb-4 focus:outline-none focus:ring-2 focus:ring-primary">
        <button @click="copyShareLink" class="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-blue-700">{{ copyButtonText }}</button>
      </div>
    </Modal>
    
    <Modal :show="isViewerOpen" @close="isViewerOpen = false">
      <div class="relative bg-black w-screen h-screen flex items-center justify-center">
        <img :src="event.imgUrls[currentImageIndex]" :style="imageViewerStyle" class="max-h-full max-w-full object-contain transition-transform duration-300">
        <div class="absolute top-4 left-4 flex gap-2">
          <button @click="rotateImage" class="text-white bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l-5 2 2-7 7 2-5 5 2 2z"></path></svg>
          </button>
        </div>
        <button @click="isViewerOpen = false" class="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors">✕</button>
        <button v-if="event.imgUrls.length > 1" @click="prevImage" class="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 text-2xl rounded-full hover:bg-black/75 transition-colors">‹</button>
        <button v-if="event.imgUrls.length > 1" @click="nextImage" class="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 text-2xl rounded-full hover:bg-black/75 transition-colors">›</button>
      </div>
    </Modal>
  </div>
  <div v-else class="text-center pt-20">Загрузка...</div>
</template>