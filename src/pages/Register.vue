<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

const authStore = useAuthStore()
const router = useRouter()
const error = ref<string | null>(null)
const isLoading = ref(false)

const handleRegister = async () => {
  if (form.password !== form.passwordConfirm) {
    error.value = 'Пароли не совпадают.'
    return
  }
  if (form.password.length < 6) {
    error.value = 'Пароль должен содержать не менее 6 символов.'
    return
  }
  
  isLoading.value = true
  error.value = null

  try {
    await authStore.register({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
    })
    // После успешной "отправки" перенаправляем на страницу подтверждения
    router.push({ name: 'ConfirmEmail' });
  } catch (err: any) {
    error.value = 'Ошибка регистрации. Возможно, пользователь с таким email уже существует.'
    isLoading.value = false
  }
}
</script>

<template>
  <div class="p-4 max-w-md mx-auto">
    <div class="bg-white p-8 rounded-lg shadow-md mt-4">
      <h1 class="text-2xl font-bold text-center mb-6">Создание аккаунта</h1>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="fullName" class="block text-sm font-medium text-gray-700">ФИО</label>
          <input v-model="form.fullName" type="text" id="fullName" required autocomplete="name"
                 class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="form.email" type="email" id="email" required autocomplete="email"
                 class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Пароль</label>
          <input v-model="form.password" type="password" id="password" required minlength="6" autocomplete="new-password"
                 class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="passwordConfirm" class="block text-sm font-medium text-gray-700">Подтвердите пароль</label>
          <input v-model="form.passwordConfirm" type="password" id="passwordConfirm" required autocomplete="new-password"
                 class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
        </div>
        <p v-if="error" class="text-sm text-red-600 pt-2">{{ error }}</p>
        <button type="submit" :disabled="isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed">
          {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>
    </div>
  </div>
</template>