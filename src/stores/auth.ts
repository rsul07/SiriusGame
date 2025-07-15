import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User, RegisterFormData } from '@/types'
import {loginApi, registerApi, getMeApi, updatePasswordApi, updateMeApi, uploadAvatarApi} from '@/api/auth'

function mapUser(backendUser: any): User {
  return {
    id: backendUser.id,
    handle: backendUser.handle,
    fullName: backendUser.full_name,
    email: backendUser.email,
    phone: backendUser.phone,
    avatarUrl: backendUser.avatar_url,
    birthday: backendUser.birthday,
    gender: backendUser.gender,
    height: backendUser.height_cm,
    weight: backendUser.weight_kg,
    is2FAEnabled: backendUser.is_2fa_enabled,
    role: backendUser.role,
    teamId: backendUser.team_id,
    isCaptain: backendUser.is_captain,
  };
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  const token = ref<string | null>(localStorage.getItem('jwt_token'));
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user_info') || 'null'));
  const redirectPath = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const userAvatar = computed(() => {
    if (user.value?.avatarUrl) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      if (user.value.avatarUrl.startsWith('http')) {
        return user.value.avatarUrl;
      }
      return `${apiUrl}${user.value.avatarUrl}`;
    }
    return '/img/icons/default-avatar.svg';
  });

  const registeredEventIds = ref<number[]>([3]);

  function setToken(newToken: string | null) {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem('jwt_token', newToken);
    } else {
      localStorage.removeItem('jwt_token');
    }
  }

  function setUser(newUser: User | null) {
    user.value = newUser;
    if (newUser) {
      localStorage.setItem('user_info', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user_info');
    }
  }

  function setRedirectPath(path: string) {
    redirectPath.value = path;
  }

  async function login(payload: { loginIdentifier: string, password: string }): Promise<void> {
    const tokenData = await loginApi({
      login_identifier: payload.loginIdentifier,
      password: payload.password,
    });
    setToken(tokenData.access_token);
    const backendUser = await getMeApi();
    const mappedUser = mapUser(backendUser);
    
    if (mappedUser.role === 'judge') {
        mappedUser.teamId = 12345;
        mappedUser.isCaptain = true;
    }
    
    setUser(mappedUser);
    await router.push(redirectPath.value || '/app/profile');
    redirectPath.value = null;
  }

  async function register(payload: RegisterFormData) {
    const birthday = payload.birthday ? new Date(payload.birthday).toISOString().split('T')[0] : '';
    await registerApi({
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone || '',
      password: payload.password || '',
      birthday: birthday,
      gender: payload.gender || 'male',
    });
  }

  async function checkAuth() {
    if (token.value) {
      try {
        const backendUser = await getMeApi();
        setUser(mapUser(backendUser));
      } catch (error) {
        console.error("Token validation failed:", error);
        logout();
      }
    }
  }

  async function updateProfile(data: Partial<User>) {
    const backendUser = await updateMeApi(data);
    setUser(mapUser(backendUser));
  }

  async function changePassword(data: any) {
    await updatePasswordApi({
      old_password: data.oldPassword,
      new_password: data.newPassword,
    });
  }

  async function uploadAvatar(file: File) {
    const backendUser = await uploadAvatarApi(file);
    setUser(mapUser(backendUser));
  }

  function logout() {
    setUser(null);
    setToken(null);
    router.push({name: 'Profile'}).then();
  }

  async function joinOrCreateTeam(action: 'join' | 'create', teamInfo: { name: string }): Promise<{ inviteLink: string }> {
    console.log(`Performing action: ${action} for team: ${teamInfo.name}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (user.value && action === 'create') {
        const newTeamId = Date.now();
        const updatedUser: User = { ...user.value, teamId: newTeamId, isCaptain: true };
        setUser(updatedUser);
    }
    
    const inviteLink = `https://sirius.game/join?team=${user.value?.teamId}&token=${Math.random().toString(36).substring(2, 10)}`;
    return { inviteLink };
  }

  function leaveTeam() {
    if (user.value) {
      const updatedUser: User = { ...user.value, teamId: undefined, isCaptain: false };
      setUser(updatedUser);
      alert('Вы вышли из команды (симуляция).');
    }
  }

  function toggleEventRegistration(eventId: number) {
    if (!user.value) return;

    const index = registeredEventIds.value.indexOf(eventId);
    if (index > -1) {
      registeredEventIds.value.splice(index, 1);
      alert('Регистрация отменена!');
    } else {
      registeredEventIds.value.push(eventId);
      alert('Вы успешно зарегистрировались на мероприятие!');
    }
  }

  return {
    token, user, isAuthenticated, userAvatar, registeredEventIds,
    login, register, logout, setRedirectPath, checkAuth,
    updateProfile, changePassword, uploadAvatar,
    joinOrCreateTeam,
    leaveTeam,
    toggleEventRegistration
  }
})