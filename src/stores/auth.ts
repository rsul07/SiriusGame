import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export interface User {
  id: string
  fullName: string
  email: string
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
  
  const registeredEventIds = ref<number[]>([1, 2]) 

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
    console.log('Logging in with:', payload)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const fakeUserFromDB: User = { 
      id: 'user-123', 
      email: payload.email,
      fullName: 'Иван Иванов',
      avatarUrl: `https://i.pravatar.cc/150?u=user-123`,
      is2FAEnabled: true,
    };

    if (fakeUserFromDB.is2FAEnabled) {
      console.log('2FA is required for this user.');
      return { requires2FA: true };
    }
    
    setAuthData('fake-jwt-token-on-login', fakeUserFromDB)
    router.push(redirectPath.value || '/app/home')
    redirectPath.value = null
    return { requires2FA: false };
  }

  async function verify2FA(code: string) {
    console.log('Verifying 2FA code:', code);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const fakeUser: User = { 
      id: 'user-123', 
      email: 'user@example.com',
      fullName: 'Иван Иванов',
      avatarUrl: `https://i.pravatar.cc/150?u=user-123`,
      is2FAEnabled: true,
    };
    
    setAuthData('fake-jwt-token-on-2fa-verified', fakeUser)
    router.push(redirectPath.value || '/app/home')
    redirectPath.value = null
  }

  async function register(payload: { fullName: string, email: string, password: string }) {
    console.log('Registering user:', payload.email);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('user_info')
    router.push({ name: 'Home' })
  }

  return { 
    token, user, isAuthenticated, userAvatar, registeredEventIds,
    login, register, logout, setRedirectPath, verify2FA
  }
})