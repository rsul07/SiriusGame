import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export interface User {
  id: string
  fullName: string
  email: string
  role: 'admin' | 'organizer' | 'judge' | 'user'
  avatarUrl?: string
  height?: number
  weight?: number
  birthday?: string
  gender?: 'male' | 'female'
  is2FAEnabled?: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  const token = ref<string | null>(localStorage.getItem('jwt_token'))
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user_info') || 'null'))
  const redirectPath = ref<string | null>(null)
  
  const registeredEventIds = ref<number[]>([1, 3]) 

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userAvatar = computed(() => user.value?.avatarUrl || '/img/icons/default-avatar.svg')

  function setAuthData(newToken: string, newUser: User) {
    user.value = newUser
    token.value = newToken
    localStorage.setItem('jwt_token', newToken)
    localStorage.setItem('user_info', JSON.stringify(newUser))
  }
  
  function setRedirectPath(path: string) {
    redirectPath.value = path
  }

  async function login(payload: { email: string, password: string }): Promise<{ requires2FA: boolean }> {
    console.log('Logging in with:', payload.email)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let role: User['role'] = 'user';
    let fullName = 'Обычный Пользователь';
    let id = payload.email;

    if (payload.email === '1') { role = 'admin'; fullName = 'Администратор'; } 
    else if (payload.email === '2') { role = 'organizer'; fullName = 'Организатор Мероприятий'; } 
    else if (payload.email === '3') { role = 'judge'; fullName = 'Судья Соревнований'; }
    
    const fakeUser: User = { id, email: `${role}@example.com`, fullName, role, avatarUrl: `https://i.pravatar.cc/150?u=${id}`, is2FAEnabled: false };
    
    if (fakeUser.is2FAEnabled) {
      return { requires2FA: true };
    }
    
    setAuthData('fake-jwt-token-on-login', fakeUser)
    router.push(redirectPath.value || '/app/home')
    redirectPath.value = null
    return { requires2FA: false };
  }

  async function register(payload: { fullName: string, email: string, password: string }) {
    console.log('Registering user:', payload.email);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // В реальном приложении бэкенд отправит письмо. Мы не авторизуем пользователя.
  }

  async function verify2FA(code: string) {
    console.log('Verifying 2FA code:', code);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // В реальном приложении бэкенд отправит письмо. Мы не авторизуем пользователя.
  }
  
  function logout() {
    // Убираем confirm() отсюда. Управление теперь только в компоненте.
    user.value = null;
    token.value = null;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    router.push({ name: 'Home' });
  }

  return { 
    token, user, isAuthenticated, userAvatar, registeredEventIds,
    login, register, logout, setRedirectPath, verify2FA
  }
})