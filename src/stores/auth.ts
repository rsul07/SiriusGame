import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@/types'

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

  // ИЗМЕНЕН ACTION LOGIN
  async function login(payload: { loginIdentifier: string, password: string }): Promise<{ requires2FA: boolean }> {
    console.log('Logging in with:', payload.loginIdentifier)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let role: User['role'] = 'user';
    let fullName = 'Обычный Пользователь';
    let id = payload.loginIdentifier;

    if (payload.loginIdentifier === '1') { role = 'admin'; fullName = 'Администратор'; } 
    else if (payload.loginIdentifier === '2') { role = 'organizer'; fullName = 'Организатор'; } 
    else if (payload.loginIdentifier === '3') { role = 'judge'; fullName = 'Судья'; }
    
    const fakeUser: User = { id, email: `${role}@example.com`, fullName, role, avatarUrl: `https://i.pravatar.cc/150?u=${id}`, is2FAEnabled: false };
    
    if (fakeUser.is2FAEnabled) { return { requires2FA: true }; }
    
    setAuthData('fake-jwt-token-on-login', fakeUser)
    router.push(redirectPath.value || '/app/home')
    redirectPath.value = null
    return { requires2FA: false };
  }

  // ИЗМЕНЕН ACTION REGISTER
  async function register(payload: Omit<User, 'id' | 'role'>) {
    console.log('Registering user:', payload);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async function verify2FA(_code: string) { // <-- ИЗМЕНЕНИЕ ЗДЕСЬ
    console.log('Verifying 2FA code:', _code);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async function joinOrCreateTeam(action: 'join' | 'create', teamInfo: { name: string }): Promise<{ inviteLink: string }> {
    console.log(`Performing action: ${action} for team: ${teamInfo.name}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const inviteLink = `https://sirius.game/join?team=${Date.now()}&token=${Math.random().toString(36).substring(2, 10)}`;
    return { inviteLink };
  }
  
  function logout() {
    if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
      user.value = null;
      token.value = null;
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
      router.push({ name: 'Home' });
    }
  }

  return { 
    token, user, isAuthenticated, userAvatar, registeredEventIds,
    login, register, logout, setRedirectPath, verify2FA,  
    joinOrCreateTeam
  }
})