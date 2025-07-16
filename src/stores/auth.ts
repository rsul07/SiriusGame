import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User, RegisterFormData, Participation } from '@/types'
import { loginApi, registerApi, getMeApi, updatePasswordApi, updateMeApi, uploadAvatarApi } from '@/api/auth'
import { getMyParticipationsApi } from '@/api/participations'

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
  const myParticipations = ref<Participation[]>([]);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const userAvatar = computed(() => {
    if (user.value?.avatarUrl) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      if (user.value.avatarUrl.startsWith('http')) {
        return user.value.avatarUrl;
      }
      return `${apiUrl}${user.value.avatarUrl}`;
    }
    return '/img/icons/default-avatar.svg';
  });

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
    await checkAuth();
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
        await fetchMyParticipations();
      } catch (error) {
        console.error("Token validation failed:", error);
        logout();
      }
    }
  }

  async function fetchMyParticipations() {
    if (!isAuthenticated.value) return;
    try {
      myParticipations.value = await getMyParticipationsApi();
    } catch (error) {
      console.error("Failed to fetch my participations:", error);
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
    myParticipations.value = [];
    router.push({name: 'Profile'}).then();
  }

  return {
    token, user, isAuthenticated, userAvatar, myParticipations,
    login, register, logout, setRedirectPath, checkAuth,
    updateProfile, changePassword, uploadAvatar, fetchMyParticipations,
  }
})