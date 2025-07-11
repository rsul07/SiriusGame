<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useEventStore } from '@/stores/events';
import { RouterLink } from 'vue-router';
import EventCardSimple from '@/components/EventCard.vue';
import Modal from '@/components/Modal.vue';
import { copyToClipboard } from '@/utils/clipboard';

const authStore = useAuthStore();
const eventStore = useEventStore();
const showSettings = ref(false);
const showLogoutConfirm = ref(false);
const activeSettingsTab = ref<'personal' | 'security'>('personal');
const loginStep = ref<'credentials' | '2fa'>('credentials');
const copyIdText = ref('Копировать ID')

const loginForm = reactive({ loginIdentifier: '', password: '' });
const loginIsLoading = ref(false);
const loginError = ref<string|null>(null);
const twoFaForm = reactive({ code: '' });

const profileForm = reactive({
  fullName: authStore.user?.fullName || '',
  height: authStore.user?.height || '',
  weight: authStore.user?.weight || '',
  birthday: authStore.user?.birthday || '',
  gender: authStore.user?.gender || '',
});
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmNewPassword: '' });

const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(authStore.user?.avatarUrl || null);
const avatarInput = ref<HTMLInputElement | null>(null);

const registeredEvents = computed(() => eventStore.events.filter(event => authStore.registeredEventIds.includes(event.id)));

const panelLink = computed(() => {
  if (!authStore.user) return null;
  switch (authStore.user.role) {
    case 'admin': return { name: 'Панель Администратора', routeName: 'AdminPanel' };
    case 'organizer': return { name: 'Панель Организатора', routeName: 'OrganizerPanel' };
    case 'judge': return { name: 'Панель Судьи', routeName: 'JudgePanel' };
    default: return null;
  }
});

const copyUserId = async () => {
  if (!authStore.user?.id) return;
  const success = await copyToClipboard(authStore.user.id);
  if (success) { copyIdText.value = 'Скопировано!'; } 
  else { copyIdText.value = 'Ошибка'; }
  setTimeout(() => { copyIdText.value = 'Копировать ID'; }, 2000);
};

const handleLogin = async () => {
  loginIsLoading.value = true;
  loginError.value = null;
  try {
    const result = await authStore.login(loginForm);
    if (result.requires2FA) {
      loginStep.value = '2fa';
    }
  } catch (e) {
    loginError.value = 'Неверный логин или пароль';
  } finally {
    loginIsLoading.value = false;
  }
};

const handle2FA = async () => {
  loginIsLoading.value = true;
  loginError.value = null;
  try {
    await authStore.verify2FA(twoFaForm.code);
  } catch (e) {
    loginError.value = 'Неверный код подтверждения';
  } finally {
    loginIsLoading.value = false;
  }
}

const handleLogout = () => {
  showLogoutConfirm.value = false;
  authStore.logout();
};

const triggerAvatarUpload = () => { avatarInput.value?.click(); };

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    avatarFile.value = target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => { avatarPreview.value = e.target?.result as string; };
    reader.readAsDataURL(avatarFile.value);
    console.log("Uploading avatar:", avatarFile.value.name);
  }
};

const handleProfileSave = () => { alert('Профиль сохранен (симуляция)'); showSettings.value = false; };
const handlePasswordChange = () => { alert('Пароль изменен (симуляция)'); showSettings.value = false; };

onMounted(() => { eventStore.fetchEvents(); });
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <!-- VIEW ДЛЯ АВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ -->
    <div v-if="authStore.isAuthenticated && authStore.user">
      <div class="flex items-start justify-between mb-8">
        <div class="flex items-center gap-4">
          <img :src="authStore.userAvatar" alt="User Avatar" class="w-20 h-20 rounded-full object-cover shadow-md">
          <div>
            <h1 class="text-3xl font-bold">{{ authStore.user.fullName }}</h1>
            <div class="flex items-center gap-2 mt-1 group cursor-pointer" @click="copyUserId">
              <p class="text-sm text-gray-500">ID: {{ authStore.user.id }}</p>
              <div class="relative">
                <svg class="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                <span class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white bg-gray-700 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{{ copyIdText }}</span>
              </div>
            </div>
          </div>
        </div>
        <button @click="showSettings = true" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </button>
      </div>

      <!-- Панель управления для роли -->
      <div v-if="panelLink" class="mb-8">
        <RouterLink 
          :to="{ name: panelLink.routeName }" 
          class="block w-full text-center p-4 bg-primary/10 rounded-lg text-primary font-bold hover:bg-primary/20 transition-colors"
        >
          {{ panelLink.name }}
        </RouterLink>
      </div>

      <h2 class="text-xl font-bold mb-4">Мои мероприятия</h2>
      <div v-if="registeredEvents.length > 0" class="space-y-3"><EventCardSimple v-for="event in registeredEvents" :key="event.id" :event="event" /></div>
      <p v-else class="text-center text-gray-500 bg-white p-6 rounded-lg shadow-sm">Вы пока не зарегистрированы на мероприятия.</p>
    </div>

    <!-- VIEW ДЛЯ ГОСТЯ -->
    <div v-else>
      <div class="bg-white p-8 rounded-lg shadow-md mt-10">
        <form v-if="loginStep === 'credentials'" @submit.prevent="handleLogin" class="space-y-4">
          <h1 class="text-2xl font-bold text-center mb-6">Вход в профиль</h1>
          <div>
            <label for="login-id" class="block text-sm font-medium text-gray-700">Email или телефон</label>
            <input v-model="loginForm.loginIdentifier" type="text" id="login-id" required autocomplete="username" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md">
          </div>
          <div>
            <label for="login-password" class="block text-sm font-medium text-gray-700">Пароль</label>
            <input v-model="loginForm.password" type="password" id="login-password" required autocomplete="current-password" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md">
          </div>
          <p v-if="loginError" class="text-sm text-red-600 pt-2">{{ loginError }}</p>
          <button type="submit" :disabled="loginIsLoading" class="w-full py-2 px-4 text-white bg-primary rounded-md disabled:bg-gray-400">Войти</button>
        </form>
        <form v-if="loginStep === '2fa'" @submit.prevent="handle2FA" class="space-y-4"><h2 class="text-xl font-bold text-center mb-2">Подтверждение входа</h2><p class="text-center text-sm text-gray-600 mb-4">Мы отправили код на вашу почту.</p><div><label for="2fa-code" class="block text-sm font-medium text-gray-700">Код подтверждения</label><input v-model="twoFaForm.code" type="text" id="2fa-code" required class="mt-1 w-full text-center tracking-[0.5em] text-lg px-3 py-2 border border-gray-300 rounded-md"></div><p v-if="loginError" class="text-sm text-red-600 pt-2">{{ loginError }}</p><button type="submit" :disabled="loginIsLoading" class="w-full py-2 px-4 text-white bg-primary rounded-md disabled:bg-gray-400">Подтвердить</button></form>
        <div class="mt-6 text-center"><p class="text-sm text-gray-600">Нет аккаунта? <RouterLink :to="{ name: 'Register' }" class="font-medium text-primary hover:underline">Зарегистрируйтесь</RouterLink></p></div>
      </div>
    </div>

    <!-- МОДАЛЬНЫЕ ОКНА -->
    <Modal :show="showSettings" @close="showSettings = false">
      <div class="p-6 relative">
        <button @click="showSettings = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        <h2 class="text-xl font-bold mb-4">Настройки</h2>
        <div class="mb-6 border-b flex"><button @click="activeSettingsTab = 'personal'" :class="['py-2 px-4 text-sm font-medium', activeSettingsTab === 'personal' ? 'border-b-2 border-primary text-primary' : 'text-gray-500']">Личные данные</button><button @click="activeSettingsTab = 'security'" :class="['py-2 px-4 text-sm font-medium', activeSettingsTab === 'security' ? 'border-b-2 border-primary text-primary' : 'text-gray-500']">Безопасность</button></div>
        <div v-if="activeSettingsTab === 'personal'" class="space-y-4"><div class="flex items-center gap-4"><img :src="avatarPreview || authStore.userAvatar" class="w-20 h-20 rounded-full object-cover"><button @click="triggerAvatarUpload" type="button" class="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 border">Сменить фото</button><input type="file" ref="avatarInput" @change="onFileSelected" class="hidden" accept="image/*"></div><div><label class="block text-sm font-medium">ФИО</label><input v-model="profileForm.fullName" class="mt-1 w-full px-3 py-2 border rounded-md"></div><div class="grid grid-cols-2 gap-4"><div><label class="block text-sm font-medium">Рост (см)</label><input v-model="profileForm.height" type="number" class="mt-1 w-full px-3 py-2 border rounded-md"></div><div><label class="block text-sm font-medium">Вес (кг)</label><input v-model="profileForm.weight" type="number" class="mt-1 w-full px-3 py-2 border rounded-md"></div></div><div><label class="block text-sm font-medium">Дата рождения</label><input v-model="profileForm.birthday" type="date" class="mt-1 w-full px-3 py-2 border rounded-md"></div><div><label class="block text-sm font-medium">Пол</label><select v-model="profileForm.gender" class="mt-1 w-full px-3 py-2 border rounded-md bg-white"><option disabled value="">Выберите пол</option><option value="male">Мужской</option><option value="female">Женский</option></select></div><button @click="handleProfileSave" class="w-full mt-4 px-4 py-2 text-white bg-primary rounded-md">Сохранить</button></div>
        <div v-if="activeSettingsTab === 'security'" class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"><div><h4 class="font-medium">Двухфакторная аутентификация</h4><p class="text-sm text-gray-500">Дополнительный уровень защиты</p></div><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" :checked="authStore.user?.is2FAEnabled" class="sr-only peer"><div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div></label></div>
          <div class="pt-4 border-t">
            <h4 class="font-medium mb-2">Смена пароля</h4>
            <div><label class="block text-sm">Старый пароль</label><input v-model="passwordForm.oldPassword" type="password" class="mt-1 w-full px-3 py-2 border rounded-md"></div>
            <div><label class="block text-sm">Новый пароль</label><input v-model="passwordForm.newPassword" type="password" class="mt-1 w-full px-3 py-2 border rounded-md"></div>
            <div><label class="block text-sm">Подтвердите</label><input v-model="passwordForm.confirmNewPassword" type="password" class="mt-1 w-full px-3 py-2 border rounded-md"></div>
            <button @click="handlePasswordChange" class="w-full mt-4 px-4 py-2 text-white bg-primary rounded-md">Сменить пароль</button>
          </div>
        </div>
        <div class="mt-8 pt-4 border-t"><button @click="showLogoutConfirm = true; showSettings = false" class="w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg><span>Выйти</span></button></div>
      </div>
    </Modal>
    <Modal :show="showLogoutConfirm" @close="showLogoutConfirm = false">
      <div class="p-6"><h3 class="text-lg font-bold">Подтверждение</h3><p class="my-4 text-gray-700">Вы уверены, что хотите выйти из аккаунта?</p><div class="flex justify-end gap-4 mt-6"><button @click="showLogoutConfirm = false" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Отмена</button><button @click="handleLogout" class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Да, выйти</button></div></div>
    </Modal>
  </div>
</template>